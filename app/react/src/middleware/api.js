import 'whatwg-fetch';

import { getToken } from './auth';

const MCS_CONSTANTS = window.MCS_CONSTANTS || {}; // eslint-disable-line no-undef
const LOCAL_URL = '/';
const API_URL = `${MCS_CONSTANTS.API_URL}/v1/`;
const PRIVATE_API_URL = `${MCS_CONSTANTS.PRIVATE_API_URL}/v1/`;

function callApi(method, endpoint, params = {}, body, authenticated, options) {

  const paramsToQueryString = (paramsArg) => {
    const paramsToArray = Object.keys(paramsArg);
    const str = paramsToArray.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsArg[key])}`).join('&');
    return str.length ? `?${str}` : '';
  };

  let url = options.adminApi ? PRIVATE_API_URL : options.localUrl ? LOCAL_URL : API_URL;
  url = `${url}${endpoint}${paramsToQueryString(params)}`;

  const token = getToken();

  const config = {
    method
  };

  if (authenticated) {
    if (token) {
      config.headers = {
        Authorization: token
      };
    } else {
      throw new Error('Error. Authenticated without token');
    }
  }

  if (body) {
    config.headers = Object.assign({}, config.headers, {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    config.body = JSON.stringify(body);
  }

  const parseJson = (response) => {
    return response.json()
            .then(json => ({ json, response }));
  };

  const checkStatus = ({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }
    return Object.assign({}, json);
  };

  return fetch(url, config) // eslint-disable-line no-undef
        .then(parseJson)
        .then(checkStatus)
        .catch(response => {
          const error = response.error ? response : { error: 'UNKNOWN_ERROR' };
          throw error;
        });
}

export const CALL_API = Symbol('Call Api');

export default store => next => action => {

  const callAPI = action[CALL_API];

  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  const { method, endpoint, params, body, types, authenticated, adminApi, localUrl, others = {} } = callAPI;
  const [requestType, successType, failureType] = types;
  const { dispatch } = store;
  const options = {
    adminApi,
    localUrl
  };

  const onRequest = (type) => {
    return {
      type,
      others
    };
  };

  const onRequestSuccess = (type, payload) => {
    return {
      type,
      response: payload,
      authenticated: true,
      body,
      others
    };
  };

  const onRequestFailure = (type, error) => {
    return {
      type,
      others,
      response: error
    };
  };

  dispatch(onRequest(requestType));

  return callApi(method, endpoint, params, body, authenticated, options)
        .then(json => dispatch(onRequestSuccess(successType, json)))
        .catch(error => {
          dispatch(onRequestFailure(failureType, error));
          return Promise.reject(error);
        });

};

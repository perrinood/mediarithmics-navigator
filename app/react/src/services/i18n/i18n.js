import 'whatwg-fetch';

import { CALL_API } from '../../middleware/api';

const publicPath = PUBLIC_PATH; // eslint-disable-line no-undef

const FETCH_TRANSLATIONS_REQUEST = 'FETCH_TRANSLATIONS_REQUEST';
const FETCH_TRANSLATIONS_SUCCESS = 'FETCH_TRANSLATIONS_SUCCESS';
const FETCH_TRANSLATIONS_FAILURE = 'FETCH_TRANSLATIONS_FAILURE';

const initI18n = (locale = 'en') => {
  return dispatch => {
    return dispatch({
      [CALL_API]: {
        method: 'get',
        localUrl: true,
        endpoint: `${publicPath}/src/assets/i18n/${locale}.json`,
        authenticated: false,
        types: [FETCH_TRANSLATIONS_REQUEST, FETCH_TRANSLATIONS_SUCCESS, FETCH_TRANSLATIONS_FAILURE]
      }
    });
  };
};

const defaultTranslationsState = {
  isLoading: false,
  isReady: false,
  translations: {}
};

const translationsState = (state = defaultTranslationsState, action) => {

  switch (action.type) {
    case FETCH_TRANSLATIONS_REQUEST:
      return {
        ...state,
        isReady: false,
        isLoading: true
      };
    case FETCH_TRANSLATIONS_SUCCESS:
      return {
        ...state,
        translations: action.response,
        isReady: true,
        isLoading: false
      };
    case FETCH_TRANSLATIONS_FAILURE:
      return {
        ...state,
        isReady: false,
        isLoading: false
      };
    default:
      return state;
  }

};

export {
  initI18n,

  translationsState
};

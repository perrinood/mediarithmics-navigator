import { CALL_API } from '../../middleware/api';

const GET_CONNECTED_USER_REQUEST = 'GET_CONNECTED_USER_REQUEST';
const GET_CONNECTED_USER_SUCCESS = 'GET_CONNECTED_USER_SUCCESS';
const GET_CONNECTED_USER_FAILURE = 'GET_CONNECTED_USER_FAILURE';

const GET_ACCESS_TOKEN_REQUEST = 'GET_ACCESS_TOKEN_REQUEST';
const GET_ACCESS_TOKEN_SUCCESS = 'GET_ACCESS_TOKEN_SUCCESS';
const GET_ACCESS_TOKEN_FAILURE = 'GET_ACCESS_TOKEN_FAILURE';

const LOGOUT = 'LOGOUT';

const getAccessToken = () => {
  return (dispatch, getState) => {

    const {
      persistedState
    } = getState();

    const body = {
      refresh_token: persistedState.refresh_token
    };

    return dispatch({
      [CALL_API]: {
        method: 'post',
        endpoint: 'authentication/access_tokens',
        body,
        types: [GET_ACCESS_TOKEN_REQUEST, GET_ACCESS_TOKEN_SUCCESS, GET_ACCESS_TOKEN_FAILURE]
      }
    });

  };
};

const getConnectedUser = () => {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        method: 'get',
        endpoint: 'connected_user',
        authenticated: true,
        types: [GET_CONNECTED_USER_REQUEST, GET_CONNECTED_USER_SUCCESS, GET_CONNECTED_USER_FAILURE]
      }
    });
  };
};

const logout = () => {
  return {
    type: LOGOUT
  };
};


const defaultSessionState = {
  user: {},
  authenticated: false
};

const sessionState = (state = defaultSessionState, action) => {

  switch (action.type) {

    case GET_ACCESS_TOKEN_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case GET_CONNECTED_USER_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case GET_ACCESS_TOKEN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        access_token: action.response.data.access_token
      };
    case GET_CONNECTED_USER_SUCCESS:
      return {
        ...state,
        isFetching: false,
        user: action.response.data,
        authenticated: true
      };

    case GET_ACCESS_TOKEN_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };
    case GET_CONNECTED_USER_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };

    case LOGOUT:
      return defaultSessionState;

    default:
      return state;
  }

};


export {
getAccessToken,
getConnectedUser,
logout,

sessionState
};

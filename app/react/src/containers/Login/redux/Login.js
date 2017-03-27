import { CALL_API } from '../../../middleware/api';

const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST';
const REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS';
const REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE';

const RESET_LOGIN = 'RESET_LOGIN';

const refreshToken = (credentials) => {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        method: 'post',
        endpoint: 'authentication/refresh_tokens',
        body: credentials,
        authenticated: false,
        types: [REFRESH_TOKEN_REQUEST, REFRESH_TOKEN_SUCCESS, REFRESH_TOKEN_FAILURE]
      }
    });
  };
};

const resetLogin = () => {
  return dispatch => {
    return dispatch({
      type: RESET_LOGIN
    });
  };
};

const defaultLoginState = {
  refresh_token: null,
  isFetching: false
};

const loginState = (state = defaultLoginState, action) => {

  switch (action.type) {

    case REFRESH_TOKEN_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        refresh_token: action.response.data.refresh_token
      };
    case REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };

    case RESET_LOGIN:
      return defaultLoginState;

    default:
      return state;
  }

};

export {
  refreshToken,
  resetLogin,

  loginState
};

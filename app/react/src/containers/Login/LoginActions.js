import { CALL_API } from '../../middleware/api';

const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST';
const REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS';
const REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE';

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

export {
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,

  refreshToken
};

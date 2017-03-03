import {
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
} from './LoginActions';

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

    default:
      return state;
  }

};

const LoginStateReducers = {
  loginState
};

export default LoginStateReducers;

import { CALL_API } from '../../middleware/api';

const GET_CONNECTED_USER_REQUEST = 'GET_CONNECTED_USER_REQUEST';
const GET_CONNECTED_USER_SUCCESS = 'GET_CONNECTED_USER_SUCCESS';
const GET_CONNECTED_USER_FAILURE = 'GET_CONNECTED_USER_FAILURE';

const GET_ACCESS_TOKEN_REQUEST = 'GET_ACCESS_TOKEN_REQUEST';
const GET_ACCESS_TOKEN_SUCCESS = 'GET_ACCESS_TOKEN_SUCCESS';
const GET_ACCESS_TOKEN_FAILURE = 'GET_ACCESS_TOKEN_FAILURE';

const INIT_WORKSPACE = 'INIT_WORKSPACE';
const SWITCH_WORKSPACE = 'SWITCH_WORKSPACE';

const IS_REACT_URL = 'IS_REACT_URL';

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

const initWorkspace = (organisationId, datamartId) => {
  return {
    type: INIT_WORKSPACE,
    workspace: {
      organisationId,
      datamartId
    }
  };
};

const switchWorkspace = workspace => {
  return {
    type: SWITCH_WORKSPACE,
    workspace
  };
};

const checkUrl = url => {
  return {
    type: IS_REACT_URL,
    url
  };
};

const logout = () => {
  return {
    type: LOGOUT
  };
};

const setActiveWorkspace = (workspace, user) => {

  let activeWorkspace = {};

  const getDefaultOrFirstWorkspace = () => {

    let defaultOrFirstWorkspace = {};

    if (user.default_workspace) {
      defaultOrFirstWorkspace = user.workspaces.find(userWorkspace => userWorkspace.organisation_id === user.default_workspace.toString());
    }

    if (!defaultOrFirstWorkspace || !defaultOrFirstWorkspace.organisationId) {
      defaultOrFirstWorkspace = user.workspaces[0];
    }

    return defaultOrFirstWorkspace;
  };

  if (workspace.organisationId) {
    activeWorkspace = user.workspaces.find(userWorkspace => userWorkspace.organisation_id === workspace.organisationId);
  }

  if (!activeWorkspace || !activeWorkspace.organisationId) {
    activeWorkspace = getDefaultOrFirstWorkspace();
  }

  return activeWorkspace;
};

const isReactUrl = url => {
  const regex = new RegExp(PUBLIC_URL); // eslint-disable-line no-undef
  return url.search(regex) >= 0;
};

const defaultSessionState = {
  user: {},
  activeWorkspace: {},
  workspaces: [],
  isReactUrl: false,
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
        workspaces: action.response.data.workspaces,
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

    case INIT_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.user)
      };

    case SWITCH_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.user)
      };

    case IS_REACT_URL:
      return {
        ...state,
        isReactUrl: isReactUrl(action.url)
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
checkUrl,
initWorkspace,
switchWorkspace,
logout,

sessionState
};

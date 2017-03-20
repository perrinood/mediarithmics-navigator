import { CALL_API } from '../../middleware/api';

const GET_CONNECTED_USER_REQUEST = 'GET_CONNECTED_USER_REQUEST';
const GET_CONNECTED_USER_SUCCESS = 'GET_CONNECTED_USER_SUCCESS';
const GET_CONNECTED_USER_FAILURE = 'GET_CONNECTED_USER_FAILURE';

const GET_ACCESS_TOKEN_REQUEST = 'GET_ACCESS_TOKEN_REQUEST';
const GET_ACCESS_TOKEN_SUCCESS = 'GET_ACCESS_TOKEN_SUCCESS';
const GET_ACCESS_TOKEN_FAILURE = 'GET_ACCESS_TOKEN_FAILURE';

const GET_WORKSPACES_REQUEST = 'GET_WORKSPACES_REQUEST';
const GET_WORKSPACES_SUCCESS = 'GET_WORKSPACES_SUCCESS';
const GET_WORKSPACES_FAILURE = 'GET_WORKSPACES_FAILURE';

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

const getWorkspaces = workspace => {
  return (dispatch, getState) => {

    const {
      sessionState: {
        user
      }
    } = getState();

    const organisationId = workspace.organisationId || user.default_workspace;

    return dispatch({
      [CALL_API]: {
        method: 'get',
        endpoint: `organisations/${organisationId}/workspace`,
        authenticated: true,
        types: [GET_WORKSPACES_REQUEST, GET_WORKSPACES_SUCCESS, GET_WORKSPACES_FAILURE]
      }
    });
  };
};

const initWorkspace = workspace => {
  return {
    type: INIT_WORKSPACE,
    workspace
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

const buildWorkspace = (workspace, datamart = {}) => {

  const {
    organisation_name: organisationName,
    organisation_id: organisationId,
    administrator,
    role
  } = workspace;

  const {
    id: datamartId,
    name: datamartName
  } = datamart;

  return {
    organisationName,
    organisationId,
    administrator,
    role,
    datamartId,
    datamartName
  };

};

const buildWorkspaces = workspaces => {

  const builtWorkspaces = [];

  workspaces.forEach(workspace => {

    if (workspace.datamarts.length) {
      workspace.datamarts.forEach(datamart => {
        builtWorkspaces.push(buildWorkspace(workspace, datamart));
      });
    } else {
      builtWorkspaces.push(buildWorkspace(workspace));
    }

  });

  return builtWorkspaces;

};

const setActiveWorkspace = (workspace, workspaces, defaultWorkspace, init = false) => {

  let activeWorkspace = {};

  const getDefaultOrFirstWorkspace = () => {

    let defaultOrFirstWorkspace = {};

    if (defaultWorkspace) {
      defaultOrFirstWorkspace = workspaces.find(userWorkspace => userWorkspace.organisationId === defaultWorkspace.toString());
    }

    if (!defaultOrFirstWorkspace || !defaultOrFirstWorkspace.organisationId) {
      defaultOrFirstWorkspace = workspaces[0];
    }

    return defaultOrFirstWorkspace;
  };

  if (init) {
    if (workspace.datamartId) {
      activeWorkspace = workspaces.find(userWorkspace => (userWorkspace.organisationId === workspace.organisationId) && (userWorkspace.datamartId === workspace.datamartId));
    } else {
      activeWorkspace = workspaces.find(userWorkspace => userWorkspace.organisationId === workspace.organisationId);
    }
  } else {
    activeWorkspace = workspace;
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
  authenticated: false,
  isFetching: false,
  isFetchingWorkspaces: false
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
    case GET_WORKSPACES_REQUEST:
      return {
        ...state,
        isFetchingWorkspaces: true
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
    case GET_WORKSPACES_SUCCESS:
      return {
        ...state,
        isFetchingWorkspaces: false,
        workspaces: buildWorkspaces([action.response.data])
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
    case GET_WORKSPACES_FAILURE:
      return {
        ...state,
        isFetchingWorkspaces: false,
        workspaces: defaultSessionState.workspaces
      };

    case INIT_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.workspaces, state.user.default_workspace, true)
      };

    case SWITCH_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.workspaces, state.user.default_workspace)
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
getWorkspaces,
checkUrl,
initWorkspace,
switchWorkspace,
logout,

sessionState
};

const SWITCH_SIDEBAR_VISIBILITY = 'SWITCH_SIDEBAR_VISIBILITY';

const switchSidebarVisibility = isVisible => {
  return (dispatch) => {
    return dispatch({
      type: SWITCH_SIDEBAR_VISIBILITY,
      isVisible
    });
  };
};

const defaultSidebarState = {
  isVisible: true
};

const sidebarState = (state = defaultSidebarState, action) => {

  switch (action.type) {

    case SWITCH_SIDEBAR_VISIBILITY:
      return {
        ...state,
        isVisible: action.isVisible ? action.isVisible : !state.isVisible
      };

    default:
      return state;
  }

};

export {
  switchSidebarVisibility,

  sidebarState
};

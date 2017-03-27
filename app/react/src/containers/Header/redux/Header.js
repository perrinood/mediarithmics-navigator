const SWITCH_VISIBILITY = 'SWITCH_VISIBILITY';

const switchVisibility = isVisible => {
  return (dispatch) => {
    return dispatch({
      type: SWITCH_VISIBILITY,
      isVisible
    });
  };
};

const defaultHeaderState = {
  isVisible: true
};

const headerState = (state = defaultHeaderState, action) => {

  switch (action.type) {

    case SWITCH_VISIBILITY:
      return {
        ...state,
        isVisible: action.isVisible ? action.isVisible : !state.isVisible
      };

    default:
      return state;
  }

};

export {
  switchVisibility,

  headerState
};

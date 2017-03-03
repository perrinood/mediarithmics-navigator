import React from 'react';
import Route from 'react-router/lib/Route';

import { Login } from '../../containers/Login';

const onEnter = store => {
  return (nextState, replace) => {

    const {
      sessionState,
      persistedState
    } = store.getState();

    if (sessionState.authenticated && persistedState.refresh_token) {
      replace(PUBLIC_URL); // eslint-disable-line no-undef
    }

  };
};

export default (store) => {
  return (
    <Route path="login" component={Login} onEnter={onEnter(store)} />
  );
};

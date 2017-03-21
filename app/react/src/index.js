import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Router from 'react-router/lib/Router';
import hashHistory from 'react-router/lib/hashHistory';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store';

import routes from './routes';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

const micsProvider = (
  <Provider store={store}>
    <Router history={history} routes={routes(store)} />
  </Provider>
);

render(
  micsProvider,
  document.getElementById('mcs-react-app') // eslint-disable-line no-undef
);

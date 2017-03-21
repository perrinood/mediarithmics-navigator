import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import hashHistory from 'react-router/lib/hashHistory';
import { routerMiddleware } from 'react-router-redux';

import { api, logoutListener } from '../middleware';
import rootReducer from '../reducers';

// Apply the middleware to the store
const reactRouterMiddleware = routerMiddleware(hashHistory);

export default function configureStore(preloadedState) {

  const composeMiddleware = compose(
    applyMiddleware(thunkMiddleware, reactRouterMiddleware, api, logoutListener),
    window.devToolsExtension ? window.devToolsExtension() : f => f, // eslint-disable-line no-undef
    f => f);

  return createStore(rootReducer, preloadedState, composeMiddleware);

}

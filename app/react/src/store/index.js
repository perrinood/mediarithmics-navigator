import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { api } from '../middleware';
import rootReducer from '../reducers';

export default function configureStore(preloadedState) {

  const composeMiddleware = compose(
    applyMiddleware(thunkMiddleware, api),
    window.devToolsExtension ? window.devToolsExtension() : f => f, // eslint-disable-line no-undef
    f => f);

  return createStore(rootReducer, preloadedState, composeMiddleware);

}

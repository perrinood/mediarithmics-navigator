import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { PersistentReducers } from './PersistentReducers';
import { SessionReducers } from '../services/session';
import { LoginReducers } from '../containers/Login/redux';
import { i18nReducers } from '../services/i18n';

const allReducers = Object.assign(
  {},

  // external reducers
  {
    form: formReducer,
  },

  PersistentReducers,
  SessionReducers,
  LoginReducers,
  i18nReducers
);

export default combineReducers(allReducers);

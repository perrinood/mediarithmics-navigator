import { combineReducers } from 'redux';

import PersistentReducers from './PersistentReducers';
import { SessionReducers } from '../services/session';
import { i18nReducers } from '../services/i18n';

const allReducers = Object.assign(
  {},
  PersistentReducers,
  SessionReducers,
  i18nReducers
);

export default combineReducers(allReducers);

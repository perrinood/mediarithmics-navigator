import { combineReducers } from 'redux';

import { i18nReducers } from '../services/i18n';

const allReducers = Object.assign(
  {},
  i18nReducers
);

export default combineReducers(allReducers);

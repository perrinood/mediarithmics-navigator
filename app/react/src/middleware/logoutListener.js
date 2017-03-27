import { removeItem } from './local-storage';

export default store => next => action => { // eslint-disable-line no-unused-vars

  if (action.type === 'LOGOUT') {
    removeItem('access_token');
    removeItem('refresh_token');
  }

  return next(action);

};

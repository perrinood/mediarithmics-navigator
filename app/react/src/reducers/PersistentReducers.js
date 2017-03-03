import { getToken, getRefreshToken } from '../middleware/auth';

export function persistedState(store = {}, action) { // eslint-disable-line no-unused-vars

  const access_token = getToken(); // eslint-disable-line camelcase
  const refresh_token = getRefreshToken(); // eslint-disable-line camelcase

  return {
    access_token,
    refresh_token
  };
}

const PersistentReducers = {
  persistedState
};

export {
  PersistentReducers
};

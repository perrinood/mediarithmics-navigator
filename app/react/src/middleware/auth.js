import {
  getItem,
  setItem
} from './local-storage';

const ID_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

const getToken = () => {
  return getItem(ID_TOKEN);
};

const getRefreshToken = () => {
  return getItem(REFRESH_TOKEN);
};

const setToken = (token) => {
  setItem({
    [ID_TOKEN]: token
  });
};

const setRefreshToken = (refreshToken) => {
  setItem({
    [REFRESH_TOKEN]: refreshToken
  });
};


export {
  ID_TOKEN,
  REFRESH_TOKEN,

  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken
};

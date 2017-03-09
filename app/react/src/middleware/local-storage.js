/* eslint-disable no-before-define */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import Cookies from 'js-cookie';

const MCS_STORAGE = 'mcs-storage';
const LANGUAGE_KEY = 'language';
const LOCAL_STORAGE_TEST = 'localStorageSupported';

function isLocalStorageSupported() {

  try {
    localStorage.setItem(LOCAL_STORAGE_TEST, true);
    localStorage.removeItem(LOCAL_STORAGE_TEST);
    return true;
  } catch (e) {
    return false;
  }
}

function initLocalStorage() {
  let localStorage = isLocalStorageSupported ? localStorage.getItem(MCS_STORAGE) : {};

  if (localStorage) {
    try {
      localStorage = JSON.parse(localStorage);
    } catch (e) {
      localStorage = {};
    }
  }

  return localStorage;
}

function getItemLocalStorage(property) {
  // use both until we have the angular app
  return localStorage.getItem(property) || getItemCookie(property);
}

function getItemCookie(property) {
  return Cookies.get(property);
}

function setItemLocalStorage(property) {

  Object.keys(property).forEach(key => {
    localStorage.setItem(key, property[key]);
  });

}

function setItemCookie(property) {

  Object.keys(property).forEach(key => {
    localStorage.setItem(key, property[key]);
  });

}

function removeItemLocalStorage(property) {
  // use both until we have the angular app
  removeItemCookie(property);
  return localStorage.removeItem(property);
}

function removeItemCookie(property) {
  return Cookies.remove(property);
}


const getItem = (property) => {
  return isLocalStorageSupported() ? getItemLocalStorage(property) : getItemCookie(property);
};

const setItem = (property) => {
  return isLocalStorageSupported() ? setItemLocalStorage(property) : setItemCookie(property);
};

const removeItem = (property) => {
  return isLocalStorageSupported ? removeItemLocalStorage(property) : removeItemCookie(property);
};

export {
  MCS_STORAGE,
  LANGUAGE_KEY,
  getItem,
  setItem,
  removeItem
};

import {
  getItem,
  setItem,
  LANGUAGE_KEY
 } from './local-storage';

const AVAILABLE_LANGUAGES = {
  FR: 'fr',
  EN: 'en'
};
const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || getNavigatorLanguage(); // eslint-disable-line no-use-before-define
const DEFAULT_PART = process.env.DEFAULT_PART;

const getLanguage = () => {
  return getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
};

const setLanguage = (language) => {
  const item = {
    [LANGUAGE_KEY]: language
  };
  return setItem(item);
};

const getContent = (part = DEFAULT_PART, language = getLanguage()) => {
  return require(`../../../i18n/${part}/${language}.json`); // eslint-disable-line import/no-dynamic-require, global-require
};

const initI18n = (language = getLanguage()) => {
  setLanguage(language);
  return getContent();
};

const getNavigatorLanguage = () => {
  let navigatorLanguage = window.navigator.language; // eslint-disable-line no-undef
  switch (true) {
    case (/fr/).test(navigatorLanguage):
      navigatorLanguage = AVAILABLE_LANGUAGES.FR;
      break;
    default:
      navigatorLanguage = AVAILABLE_LANGUAGES.EN;
  }
  return navigatorLanguage;
};

export {
  initI18n,
  getContent,
  getLanguage,
  setLanguage
};

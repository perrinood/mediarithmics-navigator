import { combineReducers } from 'redux';

// useless reducer to pass a valid object to combineReducers method
// required until a used one will be defined
const defaultReducer = (state = 0, action) => state; // eslint-disable-line no-unused-vars

const allReducers = Object.assign(
  {},
  { defaultReducer }
);

export default combineReducers(allReducers);

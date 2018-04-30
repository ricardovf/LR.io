import { combineReducers } from 'redux';
import languages from './languages';
import incrementer from './incrementer';

export default combineReducers({
  languages,
  incrementer,
});

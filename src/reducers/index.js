import { combineReducers } from 'redux';
import languages from './languages';
import selectedLanguage from './selectedLanguage';

export default combineReducers({
  languages,
  selectedLanguage,
});

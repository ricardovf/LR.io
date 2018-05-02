import React from 'react';
import { connect } from 'react-redux';
import LanguagesMenuList from '../components/LanguagesMenuList';
import { find, propEq } from 'ramda';

const mapState = state => ({
  language: find(propEq('id', state.selectedLanguage))(state.languages),
  languages: state.languages,
});

const mapDispatch = dispatch => ({
  newLanguageOnClick: dispatch.languages.create,
  selectLanguageOnClick: id => dispatch.selectedLanguage.select({ id }),
});

export default connect(mapState, mapDispatch)(LanguagesMenuList);

import React from 'react';
import { connect } from 'react-redux';
import { newLanguage, selectLanguage } from '../actions';
import LanguagesMenuList from '../components/LanguagesMenuList';
import { find, propEq } from 'ramda';

const mapStateToProps = (state, ownProps) => ({
  language: find(propEq('id', state.selectedLanguage))(state.languages),
  languages: state.languages,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  newLanguageOnClick: () => {
    dispatch(newLanguage());
  },
  selectLanguageOnClick: id => {
    dispatch(selectLanguage(id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesMenuList);

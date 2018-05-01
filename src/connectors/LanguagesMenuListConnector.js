import React from 'react';
import { connect } from 'react-redux';
import { fetchLanguages, newLanguage, selectLanguage } from '../actions';
import LanguagesMenuList from '../components/LanguagesMenuList';

const mapStateToProps = (state, ownProps) => ({
  languages: state.languages,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  newLanguageOnClick: () => {
    dispatch(newLanguage());
  },
  selectLanguageOnClick: index => {
    dispatch(selectLanguage(index));
  },
  fetchLanguages: () => {
    dispatch(fetchLanguages());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesMenuList);

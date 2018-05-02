import React from 'react';
import { connect } from 'react-redux';
import MainToolbar from '../components/MainToolbar';
import { find, propEq } from 'ramda';

const mapState = state => ({
  language: find(propEq('id', state.selectedLanguage))(state.languages),
});

const mapDispatch = dispatch => ({
  deleteOnClick: id => dispatch.languages.remove({ id }),
});

export default connect(mapState, mapDispatch)(MainToolbar);

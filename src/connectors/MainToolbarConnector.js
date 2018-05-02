import React from 'react';
import { deleteLanguage } from '../actions';
import { connect } from 'react-redux';
import MainToolbar from '../components/MainToolbar';
import { find, propEq } from 'ramda';

const mapStateToProps = (state, ownProps) => ({
  language: find(propEq('id', state.selectedLanguage))(state.languages),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  deleteOnClick: id => {
    dispatch(deleteLanguage(id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MainToolbar);

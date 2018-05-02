import React from 'react';
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import LayoutDashboard from '../components/LayoutDashboard';

const mapState = state => ({
  hasLanguages: state.languages.length > 0,
  language: find(propEq('id', state.selectedLanguage))(state.languages),
});

export default connect(mapState)(LayoutDashboard);

import React from 'react';
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import Menu from '../../components/operations/Menu';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
  };
};

const mapDispatch = dispatch => ({
  handleSave: (id, name, fsm, select = false) =>
    dispatch.languages.newLanguageFromFSM({ id, name, fsm, select }),
});

export default connect(mapState, mapDispatch)(Menu);

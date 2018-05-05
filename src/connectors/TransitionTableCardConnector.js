import React from 'react';
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import TransitionTableCard from '../components/TransitionTableCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    valid: language !== undefined && language.valid,
    fsm: language !== undefined ? language.fsm : undefined,
  };
};

const mapDispatch = dispatch => ({
  changeInitialState: (id, state) =>
    dispatch.languages.changeInitialState({ id, state }),
  addToFinalStates: (id, state) =>
    dispatch.languages.addToFinalStates({ id, state }),
  deleteFromFinalStates: (id, state) =>
    dispatch.languages.deleteFromFinalStates({ id, state }),
});

export default connect(mapState, mapDispatch)(TransitionTableCard);

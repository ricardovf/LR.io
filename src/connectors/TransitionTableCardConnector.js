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
  onGrammarChange: (id, text) => dispatch.languages.editGrammar({ id, text }),
});

export default connect(mapState, mapDispatch)(TransitionTableCard);

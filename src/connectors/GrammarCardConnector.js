import React from 'react';
import { editGrammar } from '../actions';
import { connect } from 'react-redux';
import GrammarCard from '../components/GrammarCard';
import { find, propEq } from 'ramda';
// import debounce from 'lodash/fp/debounce';

const mapStateToProps = (state, ownProps) => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    valid: language !== undefined && language.valid,
    grammar: language !== undefined ? language.grammar : undefined,
  };
};

// @todo add debounce
const mapDispatchToProps = (dispatch, ownProps) => ({
  onGrammarChange: (id, text) => {
    console.log(`editando a gramática ${id}: ${text} `);
    dispatch(editGrammar(id, text));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GrammarCard);

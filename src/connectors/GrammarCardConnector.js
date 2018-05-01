import React from 'react';
import { editGrammar } from '../actions';
import { connect } from 'react-redux';
import GrammarCard from '../components/GrammarCard';
// import debounce from 'lodash/fp/debounce';

const mapStateToProps = (state, ownProps) => ({
  valid: state.language ? state.language.isValid() : false,
  grammarText: state.languages[state.selectedLanguage]
    ? state.languages[state.selectedLanguage].grammar
    : undefined,
});

// @todo add debounce
const mapDispatchToProps = (dispatch, ownProps) => ({
  onGrammarChange: text => {
    console.log(`editando a gramática: ${text}`);
    dispatch(editGrammar(text));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GrammarCard);

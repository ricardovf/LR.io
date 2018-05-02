import React from 'react';
import { connect } from 'react-redux';
import GrammarCard from '../components/GrammarCard';
import { find, propEq } from 'ramda';
// import debounce from 'lodash/fp/debounce';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    valid: language !== undefined && language.valid,
    grammar: language !== undefined ? language.grammar : undefined,
  };
};

// @todo add debounce
const mapDispatch = dispatch => ({
  onGrammarChange: (id, text) => dispatch.languages.editGrammar({ id, text }),
});

export default connect(mapState, mapDispatch)(GrammarCard);

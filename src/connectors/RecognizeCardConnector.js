import React from 'react';
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import RecognizeCard from '../components/RecognizeCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    sentences:
      language !== undefined
        ? Array.isArray(language.userSentences)
          ? language.userSentences
          : []
        : [],
    acceptedSentences:
      language !== undefined
        ? Array.isArray(language.userSentencesAccepted)
          ? language.userSentencesAccepted
          : []
        : [],
  };
};

const mapDispatch = dispatch => ({
  onSentenceAdd: (id, sentence) =>
    dispatch.languages.addUserSentence({ id, sentence }),
  onSentenceDelete: (id, sentence) =>
    dispatch.languages.deleteUserSentence({ id, sentence }),
});

export default connect(mapState, mapDispatch)(RecognizeCard);
import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';
import Grammar from '../logic/Grammar';
import { multiTrim } from '../logic/helpers';
import * as R from 'ramda';
import FSM from '../logic/FSM';

export default {
  state: [],
  reducers: {
    create(state) {
      return [
        ...state,
        {
          id: uuidv4(),
          name: `Nova linguagem #${state.length}`,
          empty: true,
          valid: true,
          deterministic: false,
          minimal: false,
          grammar: undefined,
          expression: undefined,
          fsm: undefined,
          userSentences: [],
          userSentencesAccepted: [],
          enumeration: [],
        },
      ];
    },
    _removeLanguage(state, { id }) {
      return reject(language => language.id === id, [...state]);
    },
    _updateLanguage(state, { id, language }) {
      console.log('_updateLanguage called to update state');
      return [...state].map(item => {
        return item.id === id && language ? { ...language } : item;
      });
    },
  },
  effects: {
    async remove({ id }, rootState) {
      dispatch.languages._removeLanguage({ id });
      dispatch.selectedLanguage.select({ id: null });
    },

    async addUserSentence({ id, sentence }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      sentence = typeof sentence === 'string' ? sentence.trim() : '';

      if (language && sentence) {
        let userSentences = Array.isArray(language.userSentences)
          ? [...language.userSentences]
          : [];

        if (!userSentences.includes(sentence)) {
          // updates the accepted languages
          let userSentencesAccepted = Array.isArray(
            language.userSentencesAccepted
          )
            ? [...language.userSentencesAccepted]
            : [];

          const fsm = FSM.fromPlainObject(language.fsm);

          if (fsm && (await fsm.recognize(sentence))) {
            userSentencesAccepted.push(sentence);
          }

          language = {
            ...language,
            userSentences: [...userSentences, sentence].sort(),
            userSentencesAccepted,
          };

          dispatch.languages._updateLanguage({ id, language });
        }
      }
    },

    async deleteUserSentence({ id, sentence }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && sentence) {
        let userSentences = Array.isArray(language.userSentences)
          ? [...language.userSentences]
          : [];
        let userSentencesAccepted = Array.isArray(
          language.userSentencesAccepted
        )
          ? [...language.userSentencesAccepted]
          : [];

        userSentences = R.reject(item => item === sentence, userSentences);
        userSentencesAccepted = R.reject(
          item => item === sentence,
          userSentencesAccepted
        );

        language = {
          ...language,
          userSentences,
          userSentencesAccepted,
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    // @todo use promise to process the grammar
    editGrammar: _.debounce(
      (payload, rootState) => {
        const { id, text } = payload;

        let language = find(propEq('id', id))(rootState.languages);

        if (language) {
          const grammar = Grammar.fromText(text);
          const valid = grammar && grammar.isValid();
          const fsm = valid ? grammar.getFSM() : undefined;

          language = {
            ...language,
            valid: valid,
            grammar: valid
              ? grammar.getFormattedText() || multiTrim(text, false)
              : multiTrim(text, false),
            fsm: fsm ? fsm.toPlainObject() : undefined,
          };

          dispatch.languages._updateLanguage({ id, language });
        }
      },
      250,
      { maxWait: 1000 }
    ),
  },
};

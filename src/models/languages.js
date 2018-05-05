import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';
import Grammar from '../logic/Grammar';
import { multiTrim } from '../logic/helpers';
import * as R from 'ramda';
import FSM, { GENERATE_MAX_SIZE } from '../logic/FSM';

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
          enumerationLength: 10,
        },
      ];
    },
    _removeLanguage(state, { id }) {
      return reject(language => language.id === id, [...state]);
    },
    _updateLanguage(state, { id, language }) {
      // @todo we must recalcute some fields of the language if it changes
      // so this gotta be an effect and

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

    changeEnumerationLength({ id, length }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && length >= 1 && length <= GENERATE_MAX_SIZE) {
        language = {
          ...language,
          enumerationLength: length,
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    changeInitialState({ id, state }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm && language.fsm.states.includes(state)) {
        language = {
          ...language,
          fsm: {
            ...language.fsm,
            initial: state,
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    addToFinalStates({ id, state }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm && language.fsm.states.includes(state)) {
        language = {
          ...language,
          fsm: {
            ...language.fsm,
            finals: [...language.fsm.finals, state],
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    deleteFromFinalStates({ id, state }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm && language.fsm.states.includes(state)) {
        const newFinals = R.reject(item => item === state, language.fsm.finals);

        language = {
          ...language,
          fsm: {
            ...language.fsm,
            finals: newFinals,
          },
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

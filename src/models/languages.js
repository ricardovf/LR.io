import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';
import Grammar from '../logic/Grammar';
import { multiTrim, multiTrimNoLines } from '../logic/helpers';
import * as R from 'ramda';
import FSM, { GENERATE_MAX_SIZE } from '../logic/FSM';
import SymbolValidator from '../logic/SymbolValidator';
import { convertFromExpressionToFSM } from '../logic/Expression/Parser';

function _makeNewLanguage(name) {
  return {
    id: uuidv4(),
    name: name,
    empty: true,
    valid: true,
    grammar: undefined,
    expression: undefined,
    fsm: undefined,
    userSentences: [],
    enumerationLength: 10,
  };
}

/**
 * @todo transfer the logic to manipulate the FSM to inside the FSM class, like remove/add symbols/states, etc
 */
export default {
  state: [],
  reducers: {
    create(state, { language = undefined }) {
      if (!language)
        language = _makeNewLanguage(`Nova linguagem #${state.length}`);
      return [...state, language];
    },
    _removeLanguage(state, { id }) {
      return reject(language => language.id === id, [...state]);
    },
    _updateLanguage(state, { id, language }) {
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

    async newLanguageFromFSM({ id, name, fsm, select }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language) {
        if (fsm instanceof FSM) fsm = fsm.toPlainObject();

        let newLanguage = _makeNewLanguage(name);
        newLanguage.fsm = fsm;

        dispatch.languages.create({ language: newLanguage });

        if (select) dispatch.selectedLanguage.select({ id: newLanguage.id });
      }
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

    renameLanguage({ id, name }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && typeof name === 'string' && name.trim().length > 0) {
        language = {
          ...language,
          name: name.trim(),
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    addNewState({ id, state }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      // make new FSM if there is none
      if (language && !language.fsm) {
        language.fsm = FSM.makeEmptyFSM();
      }

      if (
        language &&
        language.fsm &&
        SymbolValidator.isValidNonTerminal(state) &&
        !language.fsm.states.includes(state)
      ) {
        language = {
          ...language,
          fsm: {
            ...language.fsm,
            states: [...language.fsm.states, state],
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    deleteState({ id, state }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm && language.fsm.states.includes(state)) {
        const newStates = R.reject(item => item === state, language.fsm.states);

        // Delete all transactions going to or from the deleted state
        let newTransitions = R.reject(R.whereEq({ from: state }))(
          language.fsm.transitions
        );
        newTransitions = R.reject(R.whereEq({ to: state }))(newTransitions);

        // Change the initial state if its the deleted state
        const newInitial =
          language.fsm.initial === state ? null : language.fsm.initial;

        // Delete from finals if state is in it
        const newFinals = R.reject(item => item === state, language.fsm.finals);

        language = {
          ...language,
          fsm: {
            ...language.fsm,
            states: newStates,
            transitions: newTransitions,
            initial: newInitial,
            finals: newFinals,
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    addNewSymbol({ id, symbol }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      // make new FSM if there is none
      if (language && !language.fsm) {
        language.fsm = FSM.makeEmptyFSM();
      }

      if (
        language &&
        language.fsm &&
        SymbolValidator.isValidTerminal(symbol) &&
        !language.fsm.alphabet.includes(symbol)
      ) {
        language = {
          ...language,
          fsm: {
            ...language.fsm,
            alphabet: [...language.fsm.alphabet, symbol],
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    deleteSymbol({ id, symbol }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm && language.fsm.alphabet.includes(symbol)) {
        const newAlphabet = R.reject(
          item => item === symbol,
          language.fsm.alphabet
        );

        // Delete all transactions using the symbol
        let newTransitions = R.reject(R.whereEq({ when: symbol }))(
          language.fsm.transitions
        );

        language = {
          ...language,
          fsm: {
            ...language.fsm,
            alphabet: newAlphabet,
            transitions: newTransitions,
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    changeTransition({ id, symbol, fromState, toStates }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (
        language &&
        language.fsm &&
        language.fsm.states.includes(fromState) &&
        language.fsm.alphabet.includes(symbol)
      ) {
        let newTransitions = R.reject(
          R.whereEq({ from: fromState, when: symbol })
        )(language.fsm.transitions);

        let newStates = [...language.fsm.states];

        // If it is a new valid state, lets add it
        for (let toState of toStates) {
          if (
            SymbolValidator.isValidNonTerminal(toState) &&
            !newStates.includes(toState)
          ) {
            newStates.push(toState);
          }

          if (newStates.includes(toState)) {
            newTransitions.push({
              from: fromState,
              to: toState,
              when: symbol,
            });
          }
        }

        language = {
          ...language,
          fsm: {
            ...language.fsm,
            states: newStates,
            transitions: R.uniq(newTransitions),
          },
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    eliminateEpsilonTransitions({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm) {
        const fsm = FSM.fromPlainObject(language.fsm);
        fsm.eliminateEpsilonTransitions();

        language = {
          ...language,
          fsm: fsm.toPlainObject(),
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    determinate({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm) {
        const fsm = FSM.fromPlainObject(language.fsm);
        fsm.determinate();

        language = {
          ...language,
          fsm: fsm.toPlainObject(),
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    minimize({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.fsm) {
        const fsm = FSM.fromPlainObject(language.fsm);
        fsm.minimize();

        language = {
          ...language,
          fsm: fsm.toPlainObject(),
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
            expression: undefined,
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

    editExpression: _.debounce(
      (payload, rootState) => {
        const { id, text } = payload;

        let language = find(propEq('id', id))(rootState.languages);

        if (language) {
          let valid = true;
          let fsm = null;
          let grammar = null;

          try {
            fsm = convertFromExpressionToFSM(text);
            grammar = fsm.toGrammar();
          } catch (e) {
            fsm = null;
            grammar = null;
            valid = false;
          }

          language = {
            ...language,
            valid: valid,
            expression: multiTrimNoLines(text),
            grammar: grammar ? grammar.getFormattedText() : undefined,
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

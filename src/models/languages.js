import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';

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
          automata: undefined,
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
      console.log(`effects/remove ${id}`);
      dispatch.languages._removeLanguage({ id });
      dispatch.selectedLanguage.select({ id: null });
    },

    editGrammar: _.debounce(
      (payload, rootState) => {
        const { id, text } = payload;

        let language = find(propEq('id', rootState.selectedLanguage))(
          rootState.languages
        );

        if (language) {
          language = { ...language, grammar: text.toUpperCase() };
        }
        dispatch.languages._updateLanguage({ id, language });
      },
      250,
      { maxWait: 1000 }
    ),
  },
};

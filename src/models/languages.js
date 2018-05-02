import uuidv4 from 'uuid/v4';
import { reject } from 'ramda';
import { dispatch } from '../store';

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
    'languages/remove': (state, { id }) => {
      console.log('languages/remove');
      return reject(language => language.id === id, [...state]);
    },
    editGrammar(state, { id, text }) {
      // @todo make async, move logic to Grammar class
      console.log(`editando a gramática ${id} para ${text}`);
      return [...state].map(language => {
        if (language.id === id) {
          language.grammar = text;
        }

        return language;
      });
    },
  },
  effects: {
    async remove({ id }, rootState) {
      console.log(`effects/remove ${id}`);
      dispatch.selectedLanguage.select({ id: null });
    },
  },
};

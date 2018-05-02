import actions from '../actions';
import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';

export default (state = [], action) => {
  switch (action.type) {
    case actions.CREATE_LANGUAGE:
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
    case actions.DELETE_LANGUAGE:
      // @todo handle side effect -> select none or first language
      return reject(language => language.id === action.id, [...state]);
    case actions.EDIT_GRAMMAR:
      // @todo make async, move logic to Grammar class
      return [...state].map(language => {
        if (language.id === action.id) {
          language.grammar = action.text;
        }

        return language;
      });
    default:
      return state;
  }
};

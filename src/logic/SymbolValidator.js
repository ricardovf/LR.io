import * as R from 'ramda';

export const EPSILON = '&';
export const SEPARATOR = '|';
export const DERIVATION = '->';
export const ACCEPT_STATE = 'Ã';
export const SPECIAL_NEW_STATE = '$';
export const STATES_NAMES = Object.freeze(
  R.map(decimal => String.fromCharCode(decimal), R.range(65, 91))
);

export default {
  isValidTerminal: terminal => {
    return /^([a-z]|[0-9]|&)$/.test(terminal);
  },
  isValidNonTerminal: nonTerminal => {
    return /^([A-Z])$/.test(nonTerminal) || nonTerminal === ACCEPT_STATE;
  },
  isEpsilon: str => {
    return str === EPSILON;
  },
};

export function makeNewUniqueStateName(states = []) {
  const possibleStates = R.difference(STATES_NAMES, states);

  let index = 0;
  let nextName = possibleStates.length ? R.head(possibleStates) : `Q${index}`;

  while (true) {
    if (!states.includes(nextName)) {
      return nextName;
    }
    nextName = `Q${++index}`;
  }
}

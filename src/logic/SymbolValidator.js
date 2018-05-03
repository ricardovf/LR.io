export const EPSILON = '&';
export const SEPARATOR = '|';
export const DERIVATION = '->';

export default {
  isValidTerminal: terminal => {
    return /^([a-z]|[0-9]|&)$/.test(terminal);
  },
  isValidNonTerminal: nonTerminal => {
    return /^([A-Z])$/.test(nonTerminal);
  },
  isEpsilon: str => {
    return str === EPSILON;
  },
};

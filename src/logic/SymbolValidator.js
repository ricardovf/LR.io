import * as R from 'ramda';

export const EPSILON = '&';
export const SEPARATOR = '|';
export const DERIVATION = '->';
export const ACCEPT_STATE = 'Ã';
export const SPECIAL_NEW_STATE = '$';
export const PHI = 'Φ';
export const STATES_NAMES = Object.freeze(
  R.map(decimal => String.fromCharCode(decimal), R.range(65, 91))
);

export default {
  isValidTerminal: terminal => {
    return /^([a-z]|[0-9]|&)$/.test(terminal);
  },
  isValidTerminalWithoutEpsilon: terminal => {
    return /^([a-z]|[0-9])$/.test(terminal);
  },
  isValidNonTerminal: nonTerminal => {
    return /^([A-Z])$/.test(nonTerminal) || nonTerminal === ACCEPT_STATE;
  },
  isStandardAtoZName: stateName => {
    return /^([A-Z])$/.test(stateName);
  },
  isStandardStateName: stateName => {
    return /^([A-Z]|Q[0-9]*)$/.test(stateName);
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

export function createDifferentNames(fsm, fsm_) {
  for (let state of fsm.states) {
    if (fsm_.states.includes(state)) {
      fixReferences(fsm_, state, fsm.states.concat(fsm_.states));
    }
  }
}

export function fixReferences(fsm_, state, states) {
  let i = fsm_.states.indexOf(state);
  let oldName = fsm_.states[i];
  let newName = makeNewUniqueStateName(states);
  fsm_.states[i] = newName;

  if (oldName === fsm_.initial) fsm_.initial = newName;

  if (fsm_.finals.includes(oldName)) {
    let i_ = fsm_.finals.indexOf(oldName);
    fsm_.finals[i_] = newName;
  }

  for (let symbol of fsm_.alphabet) {
    let paths = [
      ...R.filter(R.whereEq({ when: symbol }))(fsm_.transitions),
    ];
    for (let path of paths) {
      if (path.from === oldName) path.from = newName;
      if (path.to === oldName) path.to = newName;
    }
  }
}

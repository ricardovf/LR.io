import FSM from '../FSM';
import * as R from 'ramda';

export function union(fsm, fsm_) {
  let initial = 'S';
  let states = [initial];
  let transitions = [];
  let finals = [];

  for (let symbol of fsm.alphabet) {
    for (let state of fsm.states) {
      if (fsm.initial != state) states.push(state);
      if (fsm.finals.includes(state) && state != fsm.initial)
        finals.push(state);
      if (fsm.finals.includes(state) && state == fsm.initial)
        finals.push(initial);

      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm.transitions),
      ];
      for (let path of paths) {
        if (path.from == fsm.initial && path.to == fsm.initial) {
          transitions.push({ from: initial, to: initial, when: symbol });
        } else if (path.from == fsm.initial) {
          transitions.push({ from: initial, to: path.to, when: symbol });
        } else if (path.to == fsm.initial) {
          transitions.push({ from: path.from, to: initial, when: symbol });
        } else {
          transitions.push(path);
        }
      }
    }
  }

  for (let symbol of fsm_.alphabet) {
    for (let state of fsm_.states) {
      let newState = state + '`';
      if (fsm_.initial != state) states.push(newState);
      if (fsm_.finals.includes(state) && state != fsm_.initial)
        finals.push(newState);
      if (fsm_.finals.includes(state) && state == fsm_.initial)
        finals.push(initial);

      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm_.transitions),
      ];
      for (let path of paths) {
        if (path.from == fsm_.initial && path.to == fsm_.initial) {
          transitions.push({ from: initial, to: initial, when: symbol });
        } else if (path.from == fsm_.initial) {
          transitions.push({ from: initial, to: path.to + '`', when: symbol });
        } else if (path.to == fsm_.initial) {
          transitions.push({ from: newState, to: initial, when: symbol });
        } else {
          transitions.push({ from: newState, to: path.to + '`', when: symbol });
        }
      }
    }
  }

  return new FSM(
    R.uniq(states),
    R.uniq(fsm.alphabet.concat(fsm_.alphabet)),
    R.uniq(transitions),
    initial,
    R.uniq(finals)
  );
}

export function concatenation(fsm, fsm_) {
  let initial = fsm.initial;
  let states = fsm.states;
  let transitions = fsm.transitions;
  let finals = [];

  if (fsm_.finals.includes(fsm_.initial)) finals = fsm.finals;

  for (let symbol of fsm_.alphabet) {
    for (let state of fsm_.states) {
      let newState = state + '`';
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm_.transitions),
      ];
      for (let path of paths) {
        for (let final of fsm.finals) {
          if (path.from == fsm_.initial && path.to == fsm_.initial) {
            transitions.push({ from: final, to: final, when: symbol });
          } else if (path.from == fsm_.initial) {
            transitions.push({ from: final, to: path.to + '`', when: symbol });
          } else if (path.to == fsm_.initial) {
            transitions.push({
              from: path.from + '`',
              to: final,
              when: symbol,
            });
          } else {
            transitions.push({
              from: path.from + '`',
              to: path.to + '`',
              when: symbol,
            });
          }
        }
      }
      if (state != fsm_.initial) states.push(newState);
      if (fsm_.finals.includes(state) && state != fsm_.initial)
        finals.push(newState);
    }
  }

  return new FSM(
    R.uniq(states.concat(fsm.states)),
    R.uniq(fsm.alphabet.concat(fsm_.alphabet)),
    R.uniq(transitions),
    fsm.initial,
    R.uniq(finals)
  );
}

export function closure(fsm, fsm_) {}

export function intersection(fsm, fsm_) {}

export function difference(fsm, fsm_) {}

export function reverse(fsm) {}

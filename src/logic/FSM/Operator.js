import FSM from '../FSM';
import * as R from 'ramda';
import { createPhiState } from './Minimizer';

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

export function intersection(fsm, fsm_) {
  let initial = fsm.initial + fsm_.initial;
  let states = [];
  let alphabet = R.uniq(fsm.alphabet.concat(fsm_.alphabet));
  let transitions = [];
  let finals = [];

  for (let symbol of alphabet) {
    for (let state of fsm.states) {
      for (let state_ of fsm_.states) {
        let newState = state + state_;
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            fsm.transitions
          ),
        ];
        let paths_ = [
          ...R.filter(R.whereEq({ from: state_, when: symbol }))(
            fsm_.transitions
          ),
        ];
        if (paths.length == 0) {
          for (let path_ of paths_) {
            transitions.push({
              from: state + path_.from,
              to: state + path_.to,
              when: symbol,
            });
          }
        } else if (paths_.length == 0) {
          for (let path of paths) {
            transitions.push({
              from: path.from + state_,
              to: path.to + state_,
              when: symbol,
            });
          }
        } else {
          for (let path of paths) {
            for (let path_ of paths_) {
              transitions.push({
                from: path.from + path_.from,
                to: path.to + path_.to,
                when: symbol,
              });
            }
          }
        }
        if (fsm.finals.includes(state) && fsm_.finals.includes(state_))
          finals.push(newState);
        states.push(newState);
      }
    }
  }

  let newFsm = new FSM(
    R.uniq(states),
    alphabet,
    R.uniq(transitions),
    initial,
    R.uniq(finals)
  );
  return newFsm;
}

export function difference(fsm, fsm_) {
  negation(fsm_);
  return intersection(fsm, fsm_);
}

// export function closure(fsm){} ??

export function reverseWithSteps(fsm) {
  let reversed = fsm.clone();
  // reverse(reversed);
  return [reversed, reversed, reversed];
}

export function reverse(fsm) {
  let initial = 'Q0';
  do {
    initial += '`';
  } while (fsm.states.includes(initial));
  let transitions = [];
  let finals = [fsm.initial];
  let states = [initial];

  for (let state of fsm.states)
    if (!fsm.finals.includes(state)) states.push(state);

  for (let transition of fsm.transitions) {
    if (
      fsm.finals.includes(transition.from) &&
      fsm.finals.includes(transition.to)
    ) {
      transitions.push({ from: initial, to: initial, when: transition.when });
    } else if (fsm.finals.includes(transition.from)) {
      transitions.push({
        from: transition.to,
        to: initial,
        when: transition.when,
      });
    } else if (fsm.finals.includes(transition.to)) {
      transitions.push({
        from: initial,
        to: transition.from,
        when: transition.when,
      });
    } else {
      transitions.push({
        from: transition.to,
        to: transition.from,
        when: transition.when,
      });
    }
  }

  fsm.transitions = R.uniq(transitions);
  fsm.finals = R.uniq(finals);
  fsm.initial = initial;
  fsm.states = states;
}

export function negation(fsm) {
  if (fsm.hasIndefinition()) createPhiState(fsm);
  if (!fsm.isDeterministic()) fsm.determinate();
  for (let state of fsm.states) {
    if (fsm.finals.includes(state))
      fsm.finals.splice(fsm.finals.indexOf(state), 1);
    else fsm.finals.push(state);
  }
}

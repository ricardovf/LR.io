import FSM from '../FSM';
import * as R from 'ramda';
import { createPhiState } from './Minimizer';

export function unionWithSteps(fsm, fsm_) {
  let automatas = [];
  union(fsm.clone(), fsm_.clone(), automatas);
  return automatas;
}

export function union(fsm, fsm_, automatas = []) {
  let initial = 'S';
  let states = [initial];
  let transitions = [];
  let finals = [];
  let alphabet = fsm.alphabet.concat(fsm_.alphabet);
  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

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
      automatas.push(
        new FSM(
          R.uniq(states),
          R.uniq(alphabet),
          R.uniq(transitions),
          initial,
          R.uniq(finals)
        )
      );
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
      automatas.push(
        new FSM(
          R.uniq(states),
          R.uniq(alphabet),
          R.uniq(transitions),
          initial,
          R.uniq(finals)
        )
      );
    }
  }

  return new FSM(
    R.uniq(states),
    R.uniq(alphabet),
    R.uniq(transitions),
    initial,
    R.uniq(finals)
  );
}

export function concatenationWithSteps(fsm, fsm_) {
  let automatas = [];
  concatenation(fsm.clone(), fsm_.clone(), automatas);
  return automatas;
}

export function concatenation(fsm, fsm_, automatas = []) {
  let initial = fsm.initial;
  let states = fsm.states;
  let transitions = fsm.transitions;
  let alphabet = fsm.alphabet.concat(fsm_.alphabet);
  let finals = [];

  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );
  if (fsm_.finals.includes(fsm_.initial)) finals = fsm.finals;

  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

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
        automatas.push(
          new FSM(
            R.uniq(states),
            R.uniq(alphabet),
            R.uniq(transitions),
            initial,
            R.uniq(finals)
          )
        );
      }
      if (state != fsm_.initial) states.push(newState);
      if (fsm_.finals.includes(state) && state != fsm_.initial)
        finals.push(newState);
    }
  }

  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

  return new FSM(
    R.uniq(states.concat(fsm.states)),
    R.uniq(alphabet),
    R.uniq(transitions),
    fsm.initial,
    R.uniq(finals)
  );
}

export function intersectionWithSteps(fsm, fsm_) {
  let automatas = [];
  intersection(fsm.clone(), fsm_.clone(), automatas);
  return automatas;
}

export function intersection(fsm, fsm_, automatas = []) {
  let initial = fsm.initial + fsm_.initial;
  let states = [];
  let alphabet = R.uniq(fsm.alphabet.concat(fsm_.alphabet));
  let transitions = [];
  let finals = [];

  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

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
        automatas.push(
          new FSM(
            R.uniq(states),
            R.uniq(alphabet),
            R.uniq(transitions),
            initial,
            R.uniq(finals)
          )
        );
        if (fsm.finals.includes(state) && fsm_.finals.includes(state_))
          finals.push(newState);
        states.push(newState);
      }
    }
    automatas.push(
      new FSM(
        R.uniq(states),
        R.uniq(alphabet),
        R.uniq(transitions),
        initial,
        R.uniq(finals)
      )
    );
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

export function differenceWithSteps(fsm, fsm_) {
  let automatas = [];
  difference(fsm.clone(), fsm_.clone(), automatas);
  return automatas;
}

export function difference(fsm, fsm_, automatas = []) {
  negation(fsm_);
  return intersection(fsm, fsm_, automatas);
}

// export function closure(fsm){} ??

export function reverseWithSteps(fsm) {
  let automatas = [];
  reverse(fsm.clone(), automatas);
  return automatas;
}

export function reverse(fsm, automatas = []) {
  let initial = 'Q0';
  do {
    initial += '`';
  } while (fsm.states.includes(initial));
  let transitions = [];
  let finals = [fsm.initial];
  let states = [initial];
  automatas.push(fsm);
  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(fsm.alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

  for (let state of fsm.states) {
    if (!fsm.finals.includes(state)) {
      states.push(state);
    }
  }

  automatas.push(
    new FSM(
      R.uniq(states),
      R.uniq(fsm.alphabet),
      R.uniq(transitions),
      initial,
      R.uniq(finals)
    )
  );

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
    automatas.push(
      new FSM(
        R.uniq(states),
        R.uniq(fsm.alphabet),
        R.uniq(transitions),
        initial,
        R.uniq(finals)
      )
    );
  }

  fsm.transitions = R.uniq(transitions);
  fsm.finals = R.uniq(finals);
  fsm.initial = initial;
  fsm.states = states;
  automatas.push(fsm);
}

export function negationWithSteps(fsm) {
  let automatas = [];
  negation(fsm.clone(), automatas);
  return automatas;
}

export function negation(fsm, automatas = []) {
  automatas.push(fsm);
  if (fsm.hasIndefinition()) createPhiState(fsm);
  if (!fsm.isDeterministic()) fsm.determinate();
  automatas.push(fsm);
  for (let state of fsm.states) {
    if (fsm.finals.includes(state))
      fsm.finals.splice(fsm.finals.indexOf(state), 1);
    else fsm.finals.push(state);
    automatas.push(fsm);
  }
}

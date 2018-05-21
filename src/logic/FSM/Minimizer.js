import FSM from '../FSM';
import * as R from 'ramda';

export function detectReachableStates(state, reachableStates, transitions) {
  let paths = R.filter(R.whereEq({ from: state }))(transitions);
  for (let path of paths) {
    if (reachableStates.includes(path.to)) continue;
    reachableStates.push(path.to);
    detectReachableStates(path.to, reachableStates, transitions);
  }
}

export function getUnreachableStates(reachableStates, fsm) {
  let unreachableStates = [];
  for (let state of fsm.states) {
    if (!reachableStates.includes(state) && !unreachableStates.includes(state))
      unreachableStates.push(state);
  }
  return unreachableStates;
}

export function hasUnreachableStates(fsm) {
  let reachableStates = [fsm.initial];
  detectReachableStates(fsm.initial, reachableStates, R.clone(fsm.transitions));
  return getUnreachableStates(reachableStates, fsm).length > 0;
}

export function eliminateUnreachableStates(fsm) {
  let unreachableStates = [];
  do {
    let reachableStates = [fsm.initial];
    detectReachableStates(fsm.initial, reachableStates, fsm.transitions);
    unreachableStates = getUnreachableStates(reachableStates, fsm);
    for (let state of unreachableStates) {
      let paths = R.filter(R.whereEq({ to: state }))(fsm.transitions);
      for (let path of paths)
        fsm.transitions.splice(fsm.transitions.indexOf(path), 1);

      if (fsm.finals.includes(state))
        fsm.finals.splice(fsm.finals.indexOf(state), 1);
      fsm.states.splice(fsm.states.indexOf(state), 1);
    }
  } while (unreachableStates.length > 0);
}

export function detectAliveStates(state, aliveStates, transitions) {
  let paths = R.filter(R.whereEq({ to: state }))(transitions);
  for (let path of paths) {
    if (aliveStates.includes(path.from)) continue;
    aliveStates.push(path.from);
    if (!aliveStates.includes(state)) aliveStates.push(state);
    detectAliveStates(path.from, aliveStates, transitions);
  }
}

export function getDeadStates(aliveStates, fsm) {
  let deadStates = [];
  for (let state of fsm.states) {
    if (!aliveStates.includes(state) && !deadStates.includes(state))
      deadStates.push(state);
  }
  return deadStates;
}

export function eliminateDeadStates(fsm) {
  let deadStates = [];
  do {
    let aliveStates = [];
    for (let final of fsm.finals)
      detectAliveStates(final, aliveStates, fsm.transitions);
    deadStates = getDeadStates(aliveStates, fsm);
    for (let state of deadStates) {
      let paths = R.filter(R.whereEq({ to: state }))(fsm.transitions);
      for (let path of paths)
        fsm.transitions.splice(fsm.transitions.indexOf(path), 1);
      fsm.states.splice(fsm.states.indexOf(state), 1);
    }
  } while (deadStates.length > 0);
}

export function hasDeadStates(fsm) {
  fsm = fsm.clone();
  let deadStates = [];
  do {
    let aliveStates = [];
    for (let final of fsm.finals)
      detectAliveStates(final, aliveStates, fsm.transitions);
    deadStates = getDeadStates(aliveStates, fsm);
    if (deadStates.length > 0) {
      return true;
    }
    for (let state of deadStates) {
      let paths = R.filter(R.whereEq({ to: state }))(fsm.transitions);
      for (let path of paths)
        fsm.transitions.splice(fsm.transitions.indexOf(path), 1);
      fsm.states.splice(fsm.states.indexOf(state), 1);
    }
  } while (deadStates.length > 0);

  return false;
}

export function createPhiState(fsm) {
  fsm.states.push('PHI');
  for (let symbol of fsm.alphabet) {
    for (let state of fsm.states) {
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm.transitions),
      ];
      if (paths.length === 0) {
        fsm.transitions.push({ from: state, to: 'PHI', when: symbol });
      }
    }
  }
}

export function isMinimal(fsm) {
  fsm = fsm.clone();

  if (!fsm.isDeterministic() || hasDeadStates(fsm) || hasUnreachableStates(fsm))
    return false;

  if (fsm.hasIndefinition()) createPhiState(fsm);

  let f = [fsm.finals];
  let fk = [fsm.nonFinalStates()];
  let equivalents = [f, fk];
  let oldLengthF = 0,
    newLengthF = 0,
    oldLengthFK = 0,
    newLengthFK = 0,
    numStates = 0;
  do {
    numStates = 0;
    oldLengthF = f.length;
    oldLengthFK = fk.length;
    for (let equivalent of equivalents) {
      for (let states of equivalent) {
        for (let state of states) {
          for (let symbol of fsm.alphabet) {
            let s = R.filter(R.whereEq({ from: states[0], when: symbol }))(
              fsm.transitions
            ).pop();
            let s_ = R.filter(R.whereEq({ from: state, when: symbol }))(
              fsm.transitions
            ).pop();
            if (s !== undefined && s_ !== undefined) {
              if (!isInSameSet(s.to, s_.to, equivalent)) {
                createNewSet(states, equivalent, s_.from);
                break;
              }
            }
          }
        }
        ++numStates;
      }
    }
    newLengthF = f.length;
    newLengthFK = fk.length;
  } while (oldLengthF != newLengthF || oldLengthFK != newLengthFK);
  return numStates == fsm.states.length;
}

export function isInSameSet(state, state_, equivalent) {
  for (let states of equivalent) {
    if (states.includes(state) && states.includes(state_)) {
      return true;
    } else if (!states.includes(state) && !states.includes(state_)) {
    } else {
      return false;
    }
  }
  return true;
}

export function minimize(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of a FSM instance.`);

  if (!isMinimal(fsm)) {
    if (!fsm.isDeterministic()) fsm.determinate();
    eliminateDeadStates(fsm);
    eliminateUnreachableStates(fsm);
    if (fsm.hasIndefinition()) createPhiState(fsm);
    let f = [fsm.finals];
    let fk = [fsm.nonFinalStates()];
    let equivalents = [f, fk];
    let oldLengthF = 0,
      newLengthF = 0,
      oldLengthFK = 0,
      newLengthFK = 0;
    do {
      oldLengthF = f.length;
      oldLengthFK = fk.length;
      for (let equivalent of equivalents) {
        for (let states of equivalent) {
          for (let state of states) {
            for (let symbol of fsm.alphabet) {
              let s = R.filter(R.whereEq({ from: states[0], when: symbol }))(
                fsm.transitions
              ).pop();
              let s_ = R.filter(R.whereEq({ from: state, when: symbol }))(
                fsm.transitions
              ).pop();
              if (s !== undefined && s_ !== undefined) {
                if (!isInSameSet(s.to, s_.to, equivalent)) {
                  createNewSet(states, equivalent, s_.from);
                  break;
                }
              }
            }
          }
        }
      }
      newLengthF = f.length;
      newLengthFK = fk.length;
    } while (oldLengthF != newLengthF || oldLengthFK != newLengthFK);
    createMinimalAutomata(fsm, equivalents);
    eliminateDeadStates(fsm);
    fsm.ensureStatesNamesAreStandard();
  }
}
export function createNewSet(states, equivalent, state) {
  let newEquivalent = [state];
  states.splice(states.indexOf(state), 1);
  equivalent.push(newEquivalent);
}

export function createMinimalAutomata(fsm, equivalents) {
  let newTransitions = [];
  let newStates = [];
  let newFinals = [];
  let newInitial = '';
  let k = 0;
  for (let i = 0; i < equivalents.length; ++i) {
    for (let j = 0; j < equivalents[i].length; ++j) {
      let newState = 'Q' + k.toString();
      newStates.push(newState);
      if (i == 0) newFinals.push(newState);
      for (let state of equivalents[i][j])
        if (state == fsm.initial) newInitial = newState;
      ++k;
    }
  }
  newTransitions = createNewTransition(fsm, equivalents, newStates);
  fsm.initial = newInitial;
  fsm.states = newStates;
  fsm.finals = newFinals;
  fsm.transitions = newTransitions;
}

export function createNewTransition(fsm, equivalents, newStates) {
  let newTransitions = [];
  let k = 0;
  for (let i = 0; i < equivalents.length; ++i) {
    for (let j = 0; j < equivalents[i].length; ++j) {
      for (let symbol of fsm.alphabet) {
        let state = R.filter(
          R.whereEq({ from: equivalents[i][j][0], when: symbol })
        )(fsm.transitions).pop();
        if (state !== undefined) {
          let l = findNewStateEquivalent(state.to, equivalents);
          newTransitions.push({
            from: newStates[k],
            to: newStates[l],
            when: symbol,
          });
        }
      }
      ++k;
    }
  }
  return newTransitions;
}

export function findNewStateEquivalent(state, equivalents) {
  let k = 0;
  for (let i = 0; i < equivalents.length; ++i) {
    for (let j = 0; j < equivalents[i].length; ++j) {
      for (let state_ of equivalents[i][j]) if (state_ == state) return k;
      ++k;
    }
  }
}

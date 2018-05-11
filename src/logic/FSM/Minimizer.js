import FSM from '../FSM';
import * as R from 'ramda';
import { EPSILON } from '../SymbolValidator';

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
      fsm.states.splice(fsm.states.indexOf(state), 1);
    }
  } while (unreachableStates > 0);
}

export function detectAliveStates(state, aliveStates, transitions) {
  let paths = R.filter(R.whereEq({ to: state }))(transitions);
  for (let path of paths) {
    if (aliveStates.includes(path.from)) continue;
    aliveStates.push(path.from);
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

export function createPhiState(fsm) {
  fsm.states.push('PHI');
  for (let symbol of fsm.alphabet) {
    for (let state of fsm.states) {
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm.transitions),
      ];
      if (paths.length == 0) {
        fsm.transitions.push({ from: state, to: 'PHI', when: symbol });
      }
    }
  }
}

export function isMinimal(fsm) {
  let aliveStates = [];
  let reachableStates = [fsm.initial];
  for (let final of fsm.finals) detectAliveStates(final, aliveStates, fsm.transitions);
  detectReachableStates(fsm.initial, reachableStates, fsm.transitions);
  if (
    aliveStates.length != fsm.states.length ||
    reachableStates.length != fsm.states.length
  )
    return false;
  let equivalentSets = new Set([fsm.finals, fsm.nonFinalStates()]);
  for (let states of equivalentSets) {
    for (let symbol of fsm.alphabet) {
      let pathsForFirstState = R.filter(
        R.whereEq({ from: states[0], when: symbol })
      )(fsm.transitions);
      for (let state of states) {
        let pathsForState = R.filter(R.whereEq({ from: state, when: symbol }))(
          fsm.transitions
        );
        for (let i = 0; i < pathsForFirstState.length; ++i) {
          let s = pathsForFirstState[i].to;
          let s_ = pathsForState[i].to;
          if (!isInSameSet(s, s_, equivalentSets)) return false;
        }
      }
    }
  }
  return true;
}

export function isInSameSet(state, state_, equivalentSets) {
  for (let set of equivalentSets) {
    console.log(set.includes(state));
    console.log(state)
    console.log(set.includes(state_));
    console.log(state_);
    console.log(set);
    console.log('>>>>>>>>>>>>>>>>>>');
    if (set.includes(state) && set.includes(state_)) {
      return true;
    } else if (!set.includes(state) && !set.includes(state_)) {
      continue;
    } else {
      return false;
    }
  }
  return false;
}

// export function minize(fsm) {
//   if (!fsm instanceof FSM)
//     throw new Error(`Received ${fsm} instead of a FSM instance.`);

//   if (!isMinimal(fsm)) {
//     if (!fsm.isDeterministic()) {
//       fsm.determinate();
//     }
//     if (detectDeadStates(fsm).length > 0) eliminateDeadStates(fsm);

//     if (detectUnreachableStates(fsm).length > 0)
//       eliminateUnreachableStates(fsm);
//   }
// }

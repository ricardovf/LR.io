import FSM from '../FSM';
import * as R from 'ramda';

/**
 * For each state, will check if has more than one transition with the same symbol
 *
 * @param fsm FSM
 * @returns {boolean}
 */
export function isDeterministic(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  if (Array.isArray(fsm.transitions)) {
    let groupByFromAndWhen = R.groupBy(transition => {
      return transition.from + transition.when;
    })(fsm.transitions);

    return (
      R.values(
        R.filter(group => {
          return group.length > 1;
        }, groupByFromAndWhen)
      ).length === 0
    );
  }

  return false;
}

/**
 * Determinate automate
 *
 * @todo make more correct tests
 *
 * @param fsm FSM
 * @returns {void}
 */
export function determinate(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  if (!isDeterministic(fsm)) {
    // Eliminate epsilon transitions to ensure the determinism
    if (fsm.hasEpsilonTransitions()) {
      fsm.eliminateEpsilonTransitions();
    }

    let newInitial = fsm.initial;
    let newStates = [newInitial];
    let newTransitions = [];

    // Will store the neighbours states of the initial state in a set
    for (let symbol of fsm.alphabet) {
      let paths = [
        ...R.filter(R.whereEq({ from: fsm.initial, when: symbol }))(
          fsm.transitions
        ),
      ];

      let states = R.uniq(R.pluck('to')(paths));

      if (states.length > 0) {
        states = states.sort().join('');
        newStates.push(states);
        let transition = { from: newInitial, to: states, when: symbol };
        newTransitions.push(transition);
      }
    }

    newStates = R.uniq(newStates);

    createNewTransitionsAndStates(fsm, newStates, newTransitions);

    newTransitions = R.uniq(newTransitions);
    fsm.initial = newInitial;
    fsm.states = newStates;
    fsm.transitions = newTransitions;
    fsm.finals = createNewFinalStates(fsm, newStates);
  }
}

/**
 * For each new state will check if the current finals includes the new state
 *
 * @param fsm FSM
 * @param newStates
 * @returns {Array}
 */
function createNewFinalStates(fsm, newStates) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  let newFinalStates = [];
  for (let states of newStates) {
    states = states.split();
    for (let state of states) {
      if (fsm.finals.includes(state) && !newFinalStates.includes(state)) {
        newFinalStates.push(states);
      }
    }
  }
  return newFinalStates;
}

/**
 * Will create the union of the states for the determinization
 *
 * @param fsm FSM
 * @param newStates
 * @param newTransitions
 * @returns {void}
 */
function createNewTransitionsAndStates(fsm, newStates, newTransitions) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  // The set is composed by array of states
  for (let states of newStates) {
    for (let symbol of fsm.alphabet) {
      // Uses set to ensure uniqueness
      let to = [];
      // Will iterate through each state of the current array
      for (let state of states) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            fsm.transitions
          ),
        ];
        // For each state reachable, adds to set
        for (let path of paths) to.push(path.to);
      }

      if (to.length > 0) {
        to = R.uniq(to).sort();

        let state_ = to.join('');
        // Creates a new transition to just one state
        newTransitions.push({ from: states, to: state_, when: symbol });
        // Add the state that represents the union of the states
        newStates.push(state_);
        // Remove repeated arrays in the set
        newStates = R.uniq(newStates);
      }
    }
  }
}

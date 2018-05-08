import FSM from '../FSM';
import * as R from 'ramda';
import { EPSILON } from '../SymbolValidator';

/**
 * Check if the automata has any epsilon transitions
 *
 * @param fsm FSM
 * @returns {boolean}
 */
export function hasEpsilonTransitions(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  return (
    Array.isArray(fsm.transitions) &&
    R.filter(R.whereEq({ when: EPSILON }))(fsm.transitions).length > 0
  );
}

/**
 * Eliminate all epsilon transitions from the automata
 *
 * @param fsm FSM
 * @returns {void}
 */
export function eliminateEpsilonTransitions(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  // If the automata have no epsilon transitions, nothing is done
  if (hasEpsilonTransitions(fsm)) {
    let newTransitions = new Set();
    // Otherwise, will iterate through each state
    for (let state of fsm.states) {
      // Find all states reachable using only & symbol, using 1 or more steps
      let reachableStatesByEpsilon = findReachableStatesByEpsilon(fsm, state);
      // Will create the union of transitions for the states were reached by &
      createUnionForStates(
        fsm,
        reachableStatesByEpsilon,
        newTransitions,
        state
      );
    }
    // Update the transitions for the automata
    fsm.transitions = Array.from(newTransitions);
    // Removing epsilon from alphabet
    fsm.alphabet.splice(fsm.alphabet.indexOf(EPSILON), 1);
  }
}

/**
 * Find states reachable by & in 1 or more steps for the state passed as param
 *
 * @param fsm FSM
 * @param state
 * @param reachableStatesByEpsilon
 * @returns {Set}
 */
export function findReachableStatesByEpsilon(
  fsm,
  state,
  reachableStatesByEpsilon = new Set()
) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  // The condition is only attended if every state was checked
  if (reachableStatesByEpsilon.has(state)) {
    return reachableStatesByEpsilon;
  } else {
    // Every state reaches itself through &
    reachableStatesByEpsilon.add(state);
    let paths = [
      ...R.filter(R.whereEq({ from: state, when: EPSILON }))(fsm.transitions),
    ];
    // Find all neighbours reachable by &
    let epsilonNeighbours = R.pluck('to')(paths);
    // For each neighbour, will call fsm method
    for (let neighbour of epsilonNeighbours) {
      findReachableStatesByEpsilon(fsm, neighbour, reachableStatesByEpsilon);
    }
    return reachableStatesByEpsilon;
  }
}

/**
 * For the current state that
 *
 * @param fsm FSM
 * @param states
 * @param newTransitions
 * @param state
 * @returns {void}
 */
function createUnionForStates(fsm, states, newTransitions, state) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  for (let symbol of fsm.alphabet) {
    // & is not considered since will be eliminate it
    if (symbol !== EPSILON) {
      for (let state_ of states) {
        let transitions = [
          ...R.filter(R.whereEq({ from: state_, when: symbol }))(
            fsm.transitions
          ),
        ];
        // For each transition for a state reachable by the current state
        for (let transition of transitions) {
          // Will check if the transition is already considered
          if (!newTransitions.has(transition)) {
            // Will check if the From for the query is from the current state
            if (transition.from !== state) {
              // If not, will change the From for the current state
              let transition_ = Object.assign({}, transition);
              transition_.from = state;
              newTransitions.add(transition_);
            }
            newTransitions.add(transition);
          }
        }
      }
    }
  }
}

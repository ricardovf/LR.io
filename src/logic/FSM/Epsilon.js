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

  while (hasEpsilonTransitions(fsm)) {
    // Get one epsilon transition
    let transition = R.find(R.whereEq({ when: EPSILON }))(fsm.transitions);

    // Copy the transitions that goes from the transition and not to itself
    let newTransitions = R.filter(
      R.where({
        from: R.equals(transition.to),
        to: R.complement(R.equals(transition.to)),
      })
    )(fsm.transitions);

    // Change the from of the copy transitions
    newTransitions = R.map(R.set(R.lensProp('from'), transition.from))(
      newTransitions
    );

    // Set the new transitions
    fsm.transitions = R.uniq([...fsm.transitions, ...newTransitions]);

    // If the state is final
    if (
      fsm.finals.includes(transition.to) &&
      !fsm.finals.includes(transition.from)
    ) {
      fsm.finals.push(transition.from);
    }

    // Remove the epsilon transactions
    fsm.transitions = R.reject(R.whereEq(transition))(fsm.transitions);
  }

  fsm.alphabet.splice(fsm.alphabet.indexOf(EPSILON), 1);
}

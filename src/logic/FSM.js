import { EPSILON } from './SymbolValidator';
import * as R from 'ramda';

export const GENERATE_MAX_SIZE = 100;

export default class FSM {
  constructor(states, alphabet, transitions, initial, finals) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
    this.initial = initial;
    this.finals = finals;
  }

  isDeterministic() {
    for (let state of this.states) {
      for (let symbol of this.alphabet) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            this.transitions
          ),
        ];

        if (
          paths.length > 1 ||
          this.stateHasEpsilonAndNonEpsilonTransactions(state, symbol)
        )
          return false;
      }
    }
    return true;
  }

  stateHasEpsilonAndNonEpsilonTransactions(state, symbol) {
    let nonEpsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: symbol }))(this.transitions),
    ];
    let epsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: EPSILON }))(this.transitions),
    ];
    return nonEpsilonPaths.length >= 1 && epsilonPaths.length >= 1;
  }

  isMinimal() {
    return false;
  }

  hasCycle(state, visitedStates = new Set()) {
    if (visitedStates.has(state)) {
      return true;
    } else {
      visitedStates.add(state);
      let paths = R.filter(R.whereEq({ from: state }))(this.transitions);
      let neighbours = R.pluck('to')(paths);
      for (let neighbour of neighbours) {
        if (neighbours != state) {
          return this.hasCycle(state, visitedStates);
        } else {
          return true;
        }
      }
    }
    visitedStates.delete(state);
    return false;
  }

  hasEpsilonTransitions() {
    return (
      Array.isArray(this.transitions) &&
      R.filter(R.whereEq({ when: EPSILON }))(this.transitions).length > 0
    );
  }

  eliminateEpsilonTransitions() {
    if (this.hasEpsilonTransitions) {
      let newTransitions = new Set();
      for (let state of this.states) {
        let reachbaleStatesByEpsilon = this.findReachbableStatesbyEpsilon(
          state
        );
        this.createUnionForStates(
          reachbaleStatesByEpsilon,
          newTransitions,
          state
        );
      }
      this.transitions = Array.from(newTransitions);
      // Removing epsilon from alphabet
      this.alphabet.splice(this.alphabet.indexOf(EPSILON), 1);
    }
  }

  findReachbableStatesbyEpsilon(state, reachbaleStatesByEpsilon = new Set()) {
    if (reachbaleStatesByEpsilon.has(state)) {
      return reachbaleStatesByEpsilon;
    } else {
      reachbaleStatesByEpsilon.add(state);
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: EPSILON }))(
          this.transitions
        ),
      ];
      let epsilonNeighbours = R.pluck('to')(paths);
      for (let neighbour of epsilonNeighbours) {
        this.findReachbableStatesbyEpsilon(neighbour, reachbaleStatesByEpsilon);
      }
      return reachbaleStatesByEpsilon;
    }
  }

  createUnionForStates(states, newTransitions, state) {
    for (let symbol of this.alphabet) {
      if (symbol != EPSILON) {
        for (let state_ of states) {
          let transitions = [
            ...R.filter(R.whereEq({ from: state_, when: symbol }))(
              this.transitions
            ),
          ];
          for (let transition of transitions) {
            if (!newTransitions.has(transition)) {
              if (transition.from != state) {
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

  acceptsEmptySentence() {
    return this.finals.includes(this.initial);
  }

  /**
   * It is always true because for now a FSM can only be created using an conversion from Grammar, that only converts if
   * the Grammar is valid.
   *
   * @returns {boolean}
   */
  isValid() {
    return true;
  }

  /**
   * Works in deterministic and non deterministic FSM, with or without epsilon
   *
   * @param sentence
   * @param currentState
   * @returns {Promise<*>}
   */
  async recognize(sentence, currentState = this.initial) {
    if (
      !this.isValid() ||
      sentence === EPSILON ||
      sentence === undefined ||
      sentence === null ||
      typeof sentence !== 'string'
    )
      return false;

    sentence = sentence.toString();

    // If the sentence is empty and the current state is final, accept the sentence
    if (sentence === '') {
      return this.finals.includes(currentState);
    }

    // Get the current symbol
    const symbol = sentence.charAt(0);

    // Find all transitions going from current state with the current symbol or EPSILON
    let paths = [
      ...R.filter(R.whereEq({ from: currentState, when: symbol }))(
        this.transitions
      ),
      ...R.filter(R.whereEq({ from: currentState, when: EPSILON }))(
        this.transitions
      ),
    ];

    // If we found possible paths
    if (paths.length) {
      // make a new Promise for each path to run
      paths = R.map(path => {
        return this.recognize(
          path.when === EPSILON ? sentence : sentence.substring(1),
          path.to
        );
      }, paths);

      // @todo make it in a way that if one promise returns true, then cancel all others branches
      return (await Promise.all(paths)).includes(true);
    }

    return false;
  }

  /**
   * Generates all sentences less or equal the length passed
   *
   * @param maxLength
   * @param currentState
   * @param currentSentence
   * @returns {Array}
   */
  generate(maxLength, currentState = this.initial, currentSentence = '') {
    if (
      typeof maxLength !== 'number' ||
      maxLength < 1 ||
      maxLength > GENERATE_MAX_SIZE
    )
      throw new RangeError(
        `Size must be an integer between 1 and ${GENERATE_MAX_SIZE}. The value passed was: ${maxLength}`
      );

    if (this.hasEpsilonTransitions()) {
      // create a new FSM without epsilon transitions and run the generate there, so we prevent infinite loops
      const fsmWithoutEpsilon = new FSM(
        this.states,
        this.alphabet,
        this.transitions,
        this.initial,
        this.finals
      );
      fsmWithoutEpsilon.eliminateEpsilonTransitions();
      return fsmWithoutEpsilon.generate(
        maxLength,
        currentState,
        currentSentence
      );
    }

    let sentences = [];

    if (this.finals.includes(currentState)) {
      // console.log(
      //   `estado atual ${currentState} é final, colocando a sentença atual ${currentSentence} na lista`
      // );
      sentences.push(currentSentence);
    }

    if (currentSentence.length < maxLength) {
      // Find all transitions going from current state
      let paths = R.filter(R.whereEq({ from: currentState }))(this.transitions);

      for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
        const path = paths[pathIndex];
        const innerCurrentSentence =
          currentSentence + (path.when === EPSILON ? '' : path.when);

        sentences = [
          ...sentences,
          ...this.generate(maxLength, path.to, innerCurrentSentence),
        ];
      }
    }

    // Only sort if not on recursion
    return currentState === this.initial ? R.uniq(sentences).sort() : sentences;
  }

  toPlainObject() {
    return {
      states: [...this.states],
      alphabet: [...this.alphabet],
      initial: this.initial,
      finals: [...this.finals],
      transitions: [...this.transitions],
    };
  }

  static fromPlainObject(object) {
    try {
      return new this(
        object.states,
        object.alphabet,
        object.transitions,
        object.initial,
        object.finals
      );
    } catch (e) {
      return null;
    }
  }
}

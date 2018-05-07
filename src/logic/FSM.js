import { EPSILON } from './SymbolValidator';
import Grammar from './Grammar';
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

  /**
   * For each state, will check if has more than one transition with the same symbol
   *
   * @returns {boolean}
   */
  isDeterministic() {
    for (let state of this.states) {
      for (let symbol of this.alphabet) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            this.transitions
          ),
        ];

        // If exists a state with epsilon and other transition, so is ND
        if (
          paths.length > 1 ||
          this.stateHasEpsilonAndNonEpsilonTransactions(state, symbol)
        )
          return false;
      }
    }
    // Otherwise, is D
    return true;
  }

  determinate() {
    if (!this.isDeterministic()) {
      if (this.hasEpsilonTransitions()) this.eliminateEpsilonTransitions();
      let newStates = new Set();
      let newTransitions = new Set();
      let newInitial = [this.initial];
      newStates.add(newInitial);
      for (let symbol of this.alphabet) {
        let paths = [
          ...R.filter(R.whereEq({ from: this.initial, when: symbol }))(
            this.transitions
          ),
        ];
        let states = R.pluck('to')(paths);
        if (states.length > 0) {
          newStates.add(states);
          let transition = { from: newInitial, to: states, when: symbol };
          newTransitions.add(transition);
        }
      }

      this.createNewTransitionsAndStates(newInitial, newStates, newTransitions);
      this.removeRepeatedState(newStates);
      this.removeRepeatedTransitions(newTransitions);
      this.states = Array.from(newStates);
      this.transitions = Array.from(newTransitions);
      this.initial = newInitial;
      this.finals = this.createNewFinalStates(newStates);
    }
  }

  removeRepeatedState(setStates) {
    let arrayStates = Array.from(setStates);
    let statesToRemove = new Set();
    for (let i = 0; i < arrayStates.length; ++i) {
      for (let j = i; j < arrayStates.length; ++j) {
        if (i != j) {
          let i_ = arrayStates[i]
            .slice()
            .sort()
            .join(',');
          let j_ = arrayStates[j]
            .slice()
            .sort()
            .join(',');
          if (i_ == j_) statesToRemove.add(arrayStates[j]);
        }
      }
    }
    statesToRemove = Array.from(statesToRemove).sort();
    for (let state of statesToRemove) setStates.delete(state);
  }

  removeRepeatedTransitions(setTransitions) {
    let arrayTransitions = Array.from(setTransitions);
    let transitionsToRemove = new Set();
    for (let i = 0; i < arrayTransitions.length; ++i) {
      for (let j = i; j < arrayTransitions.length; ++j) {
        if (i != j) {
          let i_ = arrayTransitions[i].from
            .slice()
            .sort()
            .join(',');
          let j_ = arrayTransitions[j].from
            .slice()
            .sort()
            .join(',');
          if (i_ == j_ && arrayTransitions[i].when == arrayTransitions[j].when) transitionsToRemove.add(arrayTransitions[j]);
        }
      }
    }
    transitionsToRemove = Array.from(transitionsToRemove).sort();
    for (let transition of transitionsToRemove) setTransitions.delete(transition);
  }

  createNewFinalStates(newStates) {
    let newFinalStates = new Set();
    for (let final of this.finals) {
      for (let states of newStates) {
        for (let state of states) {
          if (state == final) newFinalStates.add(states);
        }
      }
    }
    return Array.from(newFinalStates);
  }

  createNewTransitionsAndStates(newInitial, newStates, newTransitions) {
    for (let states of newStates) {
      for (let symbol of this.alphabet) {
        let to = new Set();
        for (let state of states) {
          let paths = [
            ...R.filter(R.whereEq({ from: state, when: symbol }))(
              this.transitions
            ),
          ];
          for (let path of paths) to.add(path.to);
        }
        if (to.size > 0) {
          let state_ = Array.from(to);
          newTransitions.add({ from: states, to: state_, when: symbol });
          newStates.add(state_);
          this.removeRepeatedState(newStates);
        }
      }
    }
  }

  createGrammarFromFSM() {
    let pro = [];
    for (let state of this.states) {
      for (let symbol of this.alphabet) {
        let paths = [
            ...R.filter(R.whereEq({ from: state, when: symbol }))(
              this.transitions
            ),
        ];
        if (paths.length > 0) {
          for (let path of paths) {
            if (this.finals.includes(path.to)) pro.push(`${state} -> ${symbol}`);
            pro.push(`${state} -> ${symbol}${path.to}`);
          }
        }
      }
    }
    return new Grammar(this.states, this.alphabet, pro, this.initial);
  }

  /**
   * Check if the state has other than epsilon transitions
   *
   * @param state
   * @param symbol
   * @returns {boolean}
   */
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

  /**
   * Check if the automata has cycle in the graph
   *
   * @param state
   * @param visitedStates
   * @returns {boolean}
   */
  hasCycle(state, visitedStates = new Set()) {
    if (visitedStates.has(state)) {
      return true;
    } else {
      visitedStates.add(state);
      let paths = R.filter(R.whereEq({ from: state }))(this.transitions);
      let neighbours = R.pluck('to')(paths);
      // Will iterate through all neighbours from the current state searching for cycle
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

  /**
   * Check if the automata has any epsilon transitions
   *
   * @returns {boolean}
   */
  hasEpsilonTransitions() {
    return (
      Array.isArray(this.transitions) &&
      R.filter(R.whereEq({ when: EPSILON }))(this.transitions).length > 0
    );
  }

  /**
   * Eliminate all epsilon transitions from the automata
   *
   * @returns {void}
   */
  eliminateEpsilonTransitions() {
    // If the automata have no epsilon transitions, nothing is done
    if (this.hasEpsilonTransitions()) {
      let newTransitions = new Set();
      // Otherwise, will iterate through each state
      for (let state of this.states) {
        // Find all states reachable using only & symbol, using 1 or more steps
        let reachbaleStatesByEpsilon = this.findReachbableStatesbyEpsilon(
          state
        );
        // Will create the union of transitions for the states were reached by &
        this.createUnionForStates(
          reachbaleStatesByEpsilon,
          newTransitions,
          state
        );
      }
      // Update the transitions for the automata
      this.transitions = Array.from(newTransitions);
      // Removing epsilon from alphabet
      this.alphabet.splice(this.alphabet.indexOf(EPSILON), 1);
    }
  }

  /**
   * Find states reachable by & in 1 or more steps for the state passed as param
   *
   * @param state
   * @param reachableStatesByEpsilon
   * @returns {Array}
   */
  findReachbableStatesbyEpsilon(state, reachbaleStatesByEpsilon = new Set()) {
    // The condition is only atended if every state was checked
    if (reachbaleStatesByEpsilon.has(state)) {
      return reachbaleStatesByEpsilon;
    } else {
      // Every state reachs itself through &
      reachbaleStatesByEpsilon.add(state);
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: EPSILON }))(
          this.transitions
        ),
      ];
      // Find all neighbours reachable by &
      let epsilonNeighbours = R.pluck('to')(paths);
      // For each neighbour, will call this method
      for (let neighbour of epsilonNeighbours) {
        this.findReachbableStatesbyEpsilon(neighbour, reachbaleStatesByEpsilon);
      }
      return reachbaleStatesByEpsilon;
    }
  }

  /**
   * For the current state that
   *
   * @param states
   * @param newTransitions
   * @param state
   * @returns {void}
   */
  createUnionForStates(states, newTransitions, state) {
    for (let symbol of this.alphabet) {
      // & is not considered since will be eliminate it
      if (symbol != EPSILON) {
        for (let state_ of states) {
          let transitions = [
            ...R.filter(R.whereEq({ from: state_, when: symbol }))(
              this.transitions
            ),
          ];
          // For each transition for a state reachable by the current state
          for (let transition of transitions) {
            // Will check if the transition is already considered
            if (!newTransitions.has(transition)) {
              // Will check if the From for the query is from the current state
              if (transition.from != state) {
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

  acceptsEmptySentence() {
    return this.finals.includes(this.initial);
  }

  isValid() {
    return (
      this.states.length > 0 &&
      this.alphabet.length > 0 &&
      this.finals.length > 0 &&
      this.initial != undefined &&
      this.transitions.length > 0
    );
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

    return currentState === this.initial ? R.uniq(sentences) : sentences;
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

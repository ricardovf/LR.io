import { EPSILON } from './SymbolValidator';
import Grammar from './Grammar';
import * as R from 'ramda';
import { isDeterministic, determinate } from './FSM/Determinator';
import {
  eliminateEpsilonTransitions,
  hasEpsilonTransitions,
} from './FSM/Epsilon';
import { generate } from './FSM/Generator';

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
    return isDeterministic(this);
  }

  /**
   * Determinate automate, if not already determinated
   *
   * @returns {void}
   */
  determinate() {
    determinate(this);
  }

  /**
   * Return a new Grammar from the FSM
   *
   * @todo implement tests, put in own file FSM/toGrammar.js and make sure new states are single upcase chars. If there is
   * more then 26 states, then we make new states with emojs =D (https://gist.github.com/ikr7/c72843556ef3a12014c3)
   *
   * @returns {Grammar}
   */
  toGrammar() {
    let productions = [];
    for (let state of this.states) {
      for (let symbol of this.alphabet) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            this.transitions
          ),
        ];
        if (paths.length > 0) {
          for (let path of paths) {
            if (this.finals.includes(path.to))
              productions.push(`${state} -> ${symbol}`);
            productions.push(`${state} -> ${symbol}${path.to}`);
          }
        }
      }
    }
    return new Grammar(this.states, this.alphabet, productions, this.initial);
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

  minimize() {}

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
        if (neighbour !== state) {
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
    return hasEpsilonTransitions(this);
  }

  /**
   * Eliminate all epsilon transitions from the automata
   *
   * @returns {void}
   */
  eliminateEpsilonTransitions() {
    eliminateEpsilonTransitions(this);
  }

  /**
   * Returns true if the FSM accepts the sentence '' as valid
   * @returns {boolean}
   */
  acceptsEmptySentence() {
    return this.generate(1).includes('');
  }

  /**
   * For now returns true, cause the FSM generated is always valid
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
    /**
     * @type {Array}
     */
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
   * @returns {Array}
   */
  generate(maxLength) {
    return generate(this, maxLength);
  }

  /**
   * @returns {{states: *[], alphabet: *[], initial: *, finals: *[], transitions: *[]}}
   */
  toPlainObject() {
    return {
      states: [...this.states],
      alphabet: [...this.alphabet],
      initial: this.initial,
      finals: [...this.finals],
      transitions: [...this.transitions],
    };
  }

  /**
   * @param object
   * @returns {FSM}
   */
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

  /**
   * @returns {FSM}
   */
  static makeEmptyFSM() {
    return new this([], [], [], null, []);
  }
}
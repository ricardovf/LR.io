import { EPSILON } from './SymbolValidator';
import * as R from 'ramda';

export default class FSM {
  constructor(states, alphabet, transactions, initial, finals) {
    this.states = states;
    this.alphabet = alphabet;
    this.transactions = transactions;
    this.initial = initial;
    this.finals = finals;
  }

  isDeterministic() {
    // For each state, will check if there is more than one transaction with same symbol
    for (let state of this.states) {
      for (let symbol of this.alphabet) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            this.transactions
          )
        ];
        // If so, is not deterministic
        if (paths.length > 1 || this.stateHasEpsilonAndNonEpsilonTransactions(state, symbol))
          return false;
      }
    }
    // Otherwise, is deterministic
    return true;
  }

  isMinimal() {
    return false;
  }

  hasCycle() {
    return true;
  }

  // Check if a state has other transactions than epsilon
  stateHasEpsilonAndNonEpsilonTransactions(state, symbol) {
    let nonEpsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: symbol }))(
        this.transactions
      )
    ];
    let epsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: EPSILON }))(
        this.transactions
      )
    ];
    return (nonEpsilonPaths.length >= 1 && epsilonPaths.length >= 1);
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

    // Find all transactions going from current state with the current symbol or EPSILON
    let paths = [
      ...R.filter(R.whereEq({ from: currentState, when: symbol }))(
        this.transactions
      ),
      ...R.filter(R.whereEq({ from: currentState, when: EPSILON }))(
        this.transactions
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

  generate(size = 1) {
    return [];
  }

  toPlainObject() {
    return {
      states: [...this.states],
      alphabet: [...this.alphabet],
      initial: this.initial,
      finals: [...this.finals],
      transactions: [...this.transactions],
    };
  }

  static fromPlainObject(object) {
    try {
      return new this(
        object.states,
        object.alphabet,
        object.transactions,
        object.initial,
        object.finals
      );
    } catch (e) {
      return null;
    }
  }
}

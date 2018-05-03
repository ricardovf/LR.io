export default class FSM {
  constructor(states, alphabet, transactions, initial, finals) {
    this.states = states;
    this.alphabet = alphabet;
    this.transactions = transactions;
    this.initial = initial;
    this.finals = finals;
  }

  isDeterministic() {
    // check every mapping to see if there is more then one way with same symbol
  }

  isMinimal() {
    return false;
  }

  hasCycle() {
    return true;
  }

  acceptsEmptySentence() {
    return this.finals.contains(this.initial);
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

  recognize(sentence) {
    return false;
  }

  generate(size = 1) {
    return [];
  }
}

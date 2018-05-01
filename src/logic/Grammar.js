export default class Grammar {
  constructor(Vn, Vt, P, S) {
    // @todo validate
  }

  getFormattedText() {}

  isValid() {
    // @todo
    // Vn is valid
    // Vt is valid
    // P is valid and in the form of regular grammar
    // S is non terminal and belongs to Vn
    // Check if epsilon is present only in S and not elsewhere

    return false;
  }

  recognize(sentence) {
    return false;
  }

  generate(size = 1) {
    return [];
  }

  static fromAutomata(automata) {}
  static fromRegularExpression(expression) {}
  static fromText(text) {
    return new Grammar(
      ['S', 'A', 'B'],
      ['a', 'b'],
      [{ S: ['aB', 'a'] }, { A: ['a', 'bB'] }, { B: ['b', 'bS'] }],
      'S'
    );
  }
}

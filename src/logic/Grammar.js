import GrammarParser from './GrammarParser';

const parser = new GrammarParser();

let fromTextcurrentGrammar = undefined;

export default class Grammar {
  constructor(Vn, Vt, P, S) {
    this.Vn = Vn;
    this.Vt = Vt;
    this.P = P;
    this.S = S;
  }

  getFormattedText() {
    return '';
  }

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
    if (parser.changed(text)) {
      parser.run(text);
      fromTextcurrentGrammar = new Grammar(
        parser.nonTerminals(),
        parser.terminals(),
        parser.rules(),
        parser.initialSymbol()
      );
    }

    return fromTextcurrentGrammar;
  }
}

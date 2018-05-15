import FSM from '../FSM';
import { multiTrimNoLines } from '../helpers';
import SymbolValidator, { EPSILON } from '../SymbolValidator';

export const OPERATOR_STAR = '*';
export const OPERATOR_STAR_PRECEDENCE = 10;
export const OPERATOR_MAYBE = '?';
export const OPERATOR_MAYBE_PRECEDENCE = 10;
export const OPERATOR_DOT = '.';
export const OPERATOR_DOT_PRECEDENCE = 5;
export const OPERATOR_UNION = '|';
export const OPERATOR_UNION_PRECEDENCE = 1;
export const OPERATORS = [
  OPERATOR_STAR,
  OPERATOR_MAYBE,
  OPERATOR_DOT,
  OPERATOR_UNION,
];

export default class Parser {
  constructor(input = '') {
    this.input = input;
    this.fsm = null;
  }

  changed(input) {
    return input !== this._originalInput;
  }

  get input() {
    return this._input;
  }

  setInput(input) {
    this.input = input;
    return this;
  }

  set input(input) {
    if (this.changed(input)) {
      this._originalInput = input;
      this.fsm = null;

      if (typeof input !== 'string' || input === undefined || input === null) {
        input = '';
      }

      this._input = input;
    }
  }

  /**
   * Tries to convert the text regular expression to an FSM using De Simone
   * @param input
   * @throws
   * @returns {FSM}
   */
  run(input = undefined) {
    if (input !== undefined) {
      this.input = input;
    }

    try {
      // apply multiTrim (remove spaces and new lines)
      const trimmed = multiTrimNoLines(this._input);

      // make operations explicit
      const explicit = toExplicit(trimmed);

      // change to post order
      const postFixed = toPostfix(explicit);

      // build the tree nodes from the post order expression
      const tree = buildTree(postFixed);

      this.fsm = buildFSMFromTree(tree);
    } catch (e) {
      throw new Error(
        `Could not transform the input '${
          this._input
        }' to an FSM. Got the error: ${e}`
      );
    }

    return this.fsm;
  }

  /**
   * Return the precedence of the operator
   *
   * @param operator
   * @return {int} the order of the operator if its valid, otherwise, -1
   */
  static getOperatorPrecedence(operator) {
    switch (operator) {
      case OPERATOR_STAR:
        return OPERATOR_STAR_PRECEDENCE;
      case OPERATOR_MAYBE:
        return OPERATOR_MAYBE_PRECEDENCE;
      case OPERATOR_DOT:
        return OPERATOR_DOT_PRECEDENCE;
      case OPERATOR_UNION:
        return OPERATOR_UNION_PRECEDENCE;
      default:
        return -1;
    }
  }

  static isOperator(char) {
    return OPERATORS.includes(char);
  }
}

const parser = new Parser();

/**
 * @param text
 * @throws
 * @returns {FSM}
 */
export function convertFromExpressionToFSM(text) {
  return parser.run(text);
}

/**
 * Explicit the dots/concatenation (.) in the regular expression
 *
 * @param input
 * @returns {string}
 */
export function toExplicit(input) {
  let output = '';

  for (let i = 0; i < input.length - 1; i += 1) {
    let currentChar = input.charAt(i);
    output += currentChar;

    let nextChar = input.charAt(i + 1);

    if (
      (!Parser.isOperator(currentChar) &&
        !Parser.isOperator(nextChar) &&
        currentChar !== '(' &&
        nextChar !== ')') ||
      (currentChar === ')' && nextChar === '(') ||
      ((currentChar === OPERATOR_STAR || currentChar === OPERATOR_MAYBE) &&
        nextChar !== ')' &&
        (!Parser.isOperator(nextChar) || nextChar === '('))
    ) {
      output += '.';
    }
  }
  output += input.charAt(input.length - 1);

  return output;
}

/**
 * Adapted from https://gist.github.com/dineshrajpurohit/d14349fc48c6da937a04
 * Reference: http://interactivepython.org/runestone/static/pythonds/BasicDS/InfixPrefixandPostfixExpressions.html
 *
 * Infix to postfix implementation
 *
 * Algorithm:
 *  - Whenever an non operation character comes from expression we append to postfix string
 *  - Whenever a operator comes in we check the precedence of the incoming operator with the
 *    operator on the top of the stack if the stack is not null
 *  - If the precedence of the incoming operator is lower than or equal to operator on the top of
 *    the stack - Pop the operator on the stack and check the precedence again until the operator
 *    is greater than that of the operator on the stack
 *  - Append the popped operator to the postfix string
 *  - If there are no expressions left in the stack pop all the operators and append to the string
 */
export function toPostfix(input) {
  let output = '';
  let infixStack = [];

  for (let i = 0; i < input.length; i++) {
    let currentChar = input.charAt(i);
    if (currentChar === '(') {
      infixStack.push(currentChar);
    } else if (currentChar === ')') {
      while (infixStack[infixStack.length - 1] !== '(') {
        output += infixStack.pop();
      }
      infixStack.pop();
    } else if (
      SymbolValidator.isValidTerminal(currentChar) &&
      currentChar !== EPSILON
    ) {
      output += currentChar;
    } else if (Parser.isOperator(currentChar)) {
      while (
        infixStack.length !== 0 &&
        Parser.getOperatorPrecedence(currentChar) <=
          Parser.getOperatorPrecedence(infixStack[infixStack.length - 1])
      ) {
        output += infixStack.pop();
      }
      infixStack.push(currentChar);
    }
  }

  while (infixStack.length !== 0) {
    output += infixStack.pop();
  }

  return output;
}

export function buildTree(input) {}

/**
 * Build an FSM using the De Simone tree
 *
 * @param tree Node
 * @returns {FSM}
 */
function buildFSMFromTree(tree) {
  return new FSM();
}

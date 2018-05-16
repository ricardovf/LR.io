import Parser, {
  LAMBDA,
  OPERATOR_DOT,
  OPERATOR_MAYBE,
  OPERATOR_STAR,
  OPERATOR_UNION,
} from './Parser';
import * as R from 'ramda';

export default class Node {
  constructor(value, { father = null, left = null, right = null } = {}) {
    this.value = value;
    this.father = father;
    this.left = left;
    this.right = right;
  }

  /**
   * @returns {boolean}
   */
  isRoot() {
    return this.father === null;
  }

  /**
   * @returns {boolean}
   */
  hasFather() {
    return this.father !== null;
  }

  /**
   * @returns {boolean}
   */
  isLambda() {
    return this.value === LAMBDA;
  }

  /**
   * @returns {boolean}
   */
  isOperator() {
    return Parser.isOperator(this.value);
  }

  /**
   * @returns {Node}
   */
  get lastFather() {
    let lastFather = null;

    if (this.left === null || this.right === null) {
      if (this.father !== null) {
        lastFather = this.father;
        if (this.father.left !== this) {
          while (
            lastFather.father !== null &&
            lastFather.father.right !== null &&
            lastFather.father.right === lastFather
          ) {
            lastFather = lastFather.father;
          }
          lastFather = lastFather.father;
        }
      }
    }

    return lastFather;
  }

  collectNodesGoingDown() {
    if (this._down === undefined) {
      this._down = [];
      switch (this.value) {
        case OPERATOR_STAR:
        case OPERATOR_MAYBE:
          this._down = R.union(this._down, this.left.collectNodesGoingDown());
          if (this.lastFather !== null) {
            this._down = R.union(
              this._down,
              this.lastFather.collectNodesGoingUp()
            );
          } else {
            this._down = R.union(this._down, [makeLambdaNode()]);
          }
          break;
        case OPERATOR_UNION:
          this._down = R.union(this._down, this.left.collectNodesGoingDown());
          this._down = R.union(this._down, this.right.collectNodesGoingDown());
          break;
        case OPERATOR_DOT:
          this._down = R.union(this._down, this.left.collectNodesGoingDown());
          break;
        default:
          this._down = R.union(this._down, [this]);
          break;
      }
    }

    return this._down;
  }

  collectNodesGoingUp() {
    if (this._up === undefined) {
      this._up = [];
      switch (this.value) {
        case OPERATOR_STAR:
          this._up = R.union(this._up, this.left.collectNodesGoingDown());
          if (this.lastFather !== null) {
            this._up = R.union(this._up, this.lastFather.collectNodesGoingUp());
          } else {
            this._up = R.union(this._up, [makeLambdaNode()]);
          }
          break;
        case OPERATOR_MAYBE:
          if (this.lastFather !== null) {
            this._up = R.union(this._up, this.lastFather.collectNodesGoingUp());
          } else {
            this._up = R.union(this._up, [makeLambdaNode()]);
          }
          break;
        case OPERATOR_UNION:
          // Find the node most to the right
          let rightNode = this.right;
          while (rightNode.right !== null) {
            rightNode = rightNode.right;
          }
          // If the node has a deeper up father, go up through it
          if (rightNode.lastFather !== null) {
            this._up = R.union(
              this._up,
              rightNode.lastFather.collectNodesGoingUp()
            );
          } else {
            this._up = R.union(this._up, [makeLambdaNode()]);
          }
          break;
        case OPERATOR_DOT:
          this._up = R.union(this._up, this.right.collectNodesGoingDown());
          break;
        default:
          if (this.lastFather !== null) {
            this._up = R.union(this._up, this.lastFather.collectNodesGoingUp());
          } else {
            this._up = R.union(this._up, [makeLambdaNode()]);
          }
          break;
      }
    }
    return this._up;
  }

  // /**
  //  * @return {String} Formatted as: [value/lastFather, left, right]
  //  */
  // toStringWithLastFather() {
  //   return (
  //     '[' +
  //     this.value +
  //     '/' +
  //     (this.lastFather !== null ? this.lastFather.value : '') +
  //     (this.left != null ? ', ' + this.left.toStringWithLastFather() : '') +
  //     (this.right != null ? ', ' + this.right.toStringWithLastFather() : '') +
  //     ']'
  //   );
  // }

  /**
   * @return {String} Formatted as: [value, left, right]
   */
  toFormattedString() {
    return (
      '[' +
      this.value +
      (this.left !== null ? ', ' + this.left.toFormattedString() : '') +
      (this.right !== null ? ', ' + this.right.toFormattedString() : '') +
      ']'
    );
  }
}

export function makeLambdaNode() {
  return new Node(LAMBDA);
}

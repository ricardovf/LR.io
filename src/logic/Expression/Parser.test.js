import Parser, {
  buildFSMFromTree,
  buildTree,
  LAMBDA,
  toExplicit,
  toPostfix,
} from './Parser';
import { multiTrimNoLines } from '../helpers';
import * as R from 'ramda';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';

describe.only('Expression', () => {
  describe('Parser', () => {
    const parser = new Parser();

    describe('trim', () => {
      it('should remove spaces and new lines from expression', () => {
        expect(multiTrimNoLines('')).toEqual('');
        expect(multiTrimNoLines(' ')).toEqual('');
        expect(multiTrimNoLines(' a    \n   ')).toEqual('a');
        expect(multiTrimNoLines(' a   b    \n   ')).toEqual('ab');
        expect(multiTrimNoLines('a . b. c* (aaab?)\n\n*')).toEqual(
          'a.b.c*(aaab?)*'
        );
      });
    });

    describe('toExplicit', () => {
      it('should add . where needed to the regular expression', () => {
        for (let _case of cases) {
          expect(toExplicit(_case.text)).toEqual(_case.explicit);
        }
      });
    });

    describe('toPostFix', () => {
      it('should transform an explicit regular expression to postfix', () => {
        for (let _case of cases) {
          expect(toPostfix(_case.explicit)).toEqual(_case.postfix);
        }
      });
    });

    describe('buildTree', () => {
      it('should transform a simple postfix regular expression to a tree', () => {
        for (let _case of cases) {
          if (_case.tree) {
            const tree = buildTree(_case.postfix);
            expect(tree.toFormattedString()).toEqual(_case.tree);
          }
        }
      });
    });

    describe('collectNodes up and down', () => {
      it('should collect the nodes going down correctly', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        expect(tree.toFormattedString()).toEqual('[*, [., [a], [b]]]');

        expect(tree.value).toEqual('*');
        expect(tree.left.value).toEqual('.');
        expect(tree.left.left.value).toEqual('a');
        expect(tree.left.right.value).toEqual('b');
        expect(tree.left.right.lastFather.value).toEqual('*');
        expect(R.map(n => n.value)(tree.collectNodesGoingDown())).toEqual([
          'a',
          LAMBDA,
        ]);
      });

      it('should collect the nodes going up correctly', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        expect(tree.toFormattedString()).toEqual('[*, [., [a], [b]]]');

        expect(
          R.map(n => n.value)(tree.left.left.collectNodesGoingUp())
        ).toEqual(['b']);

        expect(R.map(n => n.value)(tree.left.collectNodesGoingUp())).toEqual([
          'b',
        ]);
      });
    });

    describe('make fsm', () => {
      it('should generate the correct FSM from a static one letter expression', () => {
        const tree = buildTree(toPostfix(toExplicit('a')));
        const fsm = buildFSMFromTree(tree);

        expect(fsm.states).toEqual(['A', 'B']);
        expect(fsm.initial).toEqual('A');
        expect(fsm.finals).toEqual(['B']);
        expect(fsm.alphabet).toEqual(['a']);
        expect(fsm.transitions).toEqual([{ from: 'A', to: 'B', when: 'a' }]);
        expect(fsm.generate(10)).toEqual(['a']);
      });

      it('should generate the correct FSM from a simple expression', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        const fsm = buildFSMFromTree(tree);

        expect(fsm.states).toEqual(['A', 'B']);
        expect(fsm.initial).toEqual('A');
        expect(fsm.finals).toEqual(['A']);
        expect(fsm.alphabet).toEqual(['a', 'b']);
        expect(fsm.transitions).toEqual([
          { from: 'A', to: 'B', when: 'a' },
          { from: 'B', to: 'A', when: 'b' },
        ]);
        expect(fsm.generate(10)).toEqual([
          '',
          'ab',
          'abab',
          'ababab',
          'abababab',
          'ababababab',
        ]);
      });
    });

    describe('enumerate', () => {
      it('should correctly enumerate all strings generated by a FSM converted from an regular expression', () => {
        for (let _case of cases) {
          if (_case.enumeration) {
            const length = Math.max(...R.map(e => e.length, _case.enumeration));
            const tree = buildTree(_case.postfix);
            const fsm = buildFSMFromTree(tree);

            expect(fsm.generate(length).sort()).toEqual(
              _case.enumeration.sort()
            );
          }
        }
      });
    });
  });
});

const cases = [
  {
    text: 'a',
    explicit: 'a',
    postfix: 'a',
    tree: '[a]',
    enumeration: ['a'],
  },
  {
    text: 'ab',
    explicit: 'a.b',
    postfix: 'ab.',
    tree: '[., [a], [b]]',
    enumeration: ['ab'],
  },
  {
    text: 'ab*',
    explicit: 'a.b*',
    postfix: 'ab*.',
    tree: '[., [a], [*, [b]]]',
    enumeration: ['a', 'ab', 'abb', 'abbb', 'abbbb'],
  },
  {
    text: '(ab)*',
    explicit: '(a.b)*',
    postfix: 'ab.*',
    enumeration: ['', 'ab', 'abab', 'ababab', 'abababab'],
  },
  {
    text: 'ab.c*(aaab?)*',
    explicit: 'a.b.c*.(a.a.a.b?)*',
    postfix: 'ab.c*.aa.a.b?.*.',
    enumeration: ['ab', 'abc'],
  },
  {
    text: 'a?(ba)*b?',
    explicit: 'a?.(b.a)*.b?',
    postfix: 'a?ba.*.b?.',
    tree: '[., [., [?, [a]], [*, [., [b], [a]]]], [?, [b]]]',
    enumeration: [
      '',
      'a',
      'ab',
      'aba',
      'abab',
      'ababa',
      'b',
      'ba',
      'bab',
      'baba',
      'babab',
    ],
  },
  {
    text: '(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*',
    explicit: '(a.a|b.b|(a.b|b.a).(a.a|b.b)*.(a.b|b.a))*',
    postfix: 'aa.bb.|ab.ba.|aa.bb.|*.ab.ba.|.|*',
    tree:
      '[*, [|, [|, [., [a], [a]], [., [b], [b]]], [., [., [|, [., [a], [b]], [., [b], [a]]], [*, [|, [., [a], [a]], [., [b], [b]]]]], [|, [., [a], [b]], [., [b], [a]]]]]]',
    // enumeration: [
    //   '',
    //   'aa',
    //   'aaaa',
    //   'aabb',
    //   'abab',
    //   'abba',
    //   'baab',
    //   'baba',
    //   'bb',
    //   'bbaa',
    //   'bbbb',
    // ],
  },
  {
    text: '(a?(ba)*b?)|(b?(ab)*a?)',
    explicit: '(a?.(b.a)*.b?)|(b?.(a.b)*.a?)',
    postfix: 'a?ba.*.b?.b?ab.*.a?.|',
    tree:
      '[|, [., [., [?, [a]], [*, [., [b], [a]]]], [?, [b]]], [., [., [?, [b]], [*, [., [a], [b]]]], [?, [a]]]]',
    enumeration: [
      '',
      'a',
      'ab',
      'aba',
      'abab',
      'ababa',
      'b',
      'ba',
      'bab',
      'baba',
      'babab',
    ],
  },
  {
    text: '((a?(ba)*b?)|(b?(ab)*a?)',
    explicit: '((a?.(b.a)*.b?)|(b?.(a.b)*.a?)',
    postfix: 'a?ba.*.b?.b?ab.*.a?.|(',
    enumeration: null,
  },
];

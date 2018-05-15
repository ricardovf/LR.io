import Parser, { toExplicit, toPostfix } from './Parser';
import { multiTrimNoLines } from '../helpers';

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
      it('should add . where needed', () => {
        for (let _case of cases) {
          expect(toExplicit(_case.text)).toEqual(_case.explicit);
        }
      });
    });

    describe('toPostFix', () => {
      it('should transform to postfix', () => {
        for (let _case of cases) {
          expect(toPostfix(_case.explicit)).toEqual(_case.postfix);
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
    tree: ['a'],
    enumeration: ['a'],
  },
  {
    text: 'ab',
    explicit: 'a.b',
    postfix: 'ab.',
    enumeration: ['ab'],
  },
  {
    text: 'ab*',
    explicit: 'a.b*',
    postfix: 'ab*.',
    enumeration: ['a', 'ab', 'abb', 'abbb', 'abbbb'],
  },
  {
    text: '(ab)*',
    explicit: '(a.b)*',
    postfix: 'ab.*',
    enumeration: ['', 'ab', 'abab', 'ab', 'ababab'],
  },
  {
    text: 'ab.c*(aaab?)*',
    explicit: 'a.b.c*.(a.a.a.b?)*',
    postfix: 'ab.c*.aa.a.b?.*.',
    enumeration: [
      'ab',
      'abc',
      'abcc',
      'abcccc',
      'abaaa',
      'abaaab',
      'abcaaabaaab',
    ],
  },
  {
    text: '(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*',
    explicit: '(a.a|b.b|(a.b|b.a).(a.a|b.b)*.(a.b|b.a))*',
    postfix: 'aa.bb.|ab.ba.|aa.bb.|*.ab.ba.|.|*',
    enumeration: [
      '',
      'aa',
      'aaaa',
      'aabb',
      'abab',
      'abba',
      'baab',
      'baba',
      'bb',
      'bbaa',
      'bbbb',
    ],
  },
  {
    text: '(a?(ba)*b?)|(b?(ab)*a?)',
    explicit: '(a?.(b.a)*.b?)|(b?.(a.b)*.a?)',
    postfix: 'a?ba.*.b?.b?ab.*.a?.|',
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

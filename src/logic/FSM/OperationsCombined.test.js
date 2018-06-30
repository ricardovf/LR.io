import Parser, {
  buildFSMFromTree,
  buildTree,
  convertFromExpressionToFSM,
  LAMBDA,
  toExplicit,
  toPostfix,
} from '../Expression/Parser';

import FSM from '../FSM';
import {
  concatenation,
  difference,
  intersection,
  negation,
  reverse,
  union,
  closure,
} from './Operator';

describe('FSM', () => {
  describe('intersection and difference', () => {
    it('should intersect a-pair b-pair', async () => {
      let states = ['A', 'B', 'C'];
      let alphabet = ['a', 'b'];
      let transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'B', to: 'C', when: 'a' },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'C', to: 'B', when: 'a' },
        { from: 'C', to: 'C', when: 'b' },
      ];
      let initial = 'A';
      let finals = ['A', 'C'];
      const aPair = new FSM(states, alphabet, transitions, initial, finals);

      expect(await aPair.recognize('')).toBeTruthy();
      expect(await aPair.recognize('aa')).toBeTruthy();
      expect(await aPair.recognize('aabaa')).toBeTruthy();

      states = ['A', 'B', 'C'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'C', when: 'a' },
        { from: 'C', to: 'B', when: 'b' },
      ];
      initial = 'A';
      finals = ['A', 'C'];
      const bPair = new FSM(states, alphabet, transitions, initial, finals);

      expect(await bPair.recognize('')).toBeTruthy();
      expect(await bPair.recognize('bab')).toBeTruthy();
      expect(await bPair.recognize('bbabaab')).toBeTruthy();

      const newFsm = intersection(aPair, bPair);

      expect(await newFsm.recognize('bab')).toBeFalsy();
      expect(await newFsm.recognize('bbaa')).toBeTruthy();
      expect(await newFsm.recognize('ababaa')).toBeTruthy();
      expect(await newFsm.recognize('ababaab')).toBeFalsy();
    });

    it('should intersect non consecutive a non consecutive b', async () => {
      let tree = buildTree(toPostfix(toExplicit('(b)*a?(ba?)*')));
      const nonConsecutiveA = buildFSMFromTree(tree);

      expect(await nonConsecutiveA.recognize('a')).toBeTruthy();
      expect(await nonConsecutiveA.recognize('aba')).toBeTruthy();
      expect(await nonConsecutiveA.recognize('baa')).toBeFalsy();

      tree = buildTree(toPostfix(toExplicit('(a)*b?(ab?)*')));
      const nonConsecutiveB = buildFSMFromTree(tree);

      expect(await nonConsecutiveB.recognize('')).toBeTruthy();
      expect(await nonConsecutiveB.recognize('aaaba')).toBeTruthy();
      expect(await nonConsecutiveB.recognize('ababb')).toBeFalsy();

      const newFsm = intersection(nonConsecutiveA, nonConsecutiveB);

      expect(await newFsm.recognize('aa')).toBeFalsy();
      expect(await newFsm.recognize('aba')).toBeTruthy();
      expect(await newFsm.recognize('ababaa')).toBeFalsy();
      expect(await newFsm.recognize('baba')).toBeTruthy();
    });

    it('should apply difference a-pair b-odd', async () => {
      let states = ['A', 'B', 'C'];
      let alphabet = ['a', 'b'];
      let transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'B', to: 'C', when: 'a' },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'C', to: 'B', when: 'a' },
        { from: 'C', to: 'C', when: 'b' },
      ];
      let initial = 'A';
      let finals = ['A', 'C'];
      const aPair = new FSM(states, alphabet, transitions, initial, finals);

      expect(await aPair.recognize('')).toBeTruthy();
      expect(await aPair.recognize('aa')).toBeTruthy();
      expect(await aPair.recognize('aabaa')).toBeTruthy();

      states = ['A', 'B', 'C', 'D'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'C', when: 'a' },
        { from: 'C', to: 'D', when: 'b' },
        { from: 'D', to: 'D', when: 'a' },
        { from: 'D', to: 'C', when: 'b' },
      ];
      initial = 'A';
      finals = ['B', 'D'];
      const bOdd = new FSM(states, alphabet, transitions, initial, finals);

      expect(await bOdd.recognize('')).toBeFalsy();
      expect(await bOdd.recognize('bab')).toBeFalsy();
      expect(await bOdd.recognize('bbaaba')).toBeTruthy();

      const newFsm = difference(aPair, bOdd);

      expect(await newFsm.recognize('aa')).toBeTruthy();
      expect(await newFsm.recognize('aba')).toBeFalsy();
      expect(await newFsm.recognize('ababaa')).toBeTruthy();
      expect(await newFsm.recognize('baaba')).toBeFalsy();
    });
  });
});

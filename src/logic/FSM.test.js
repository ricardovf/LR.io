import Grammar from './Grammar';
import { EPSILON, ACCEPT_STATE } from './SymbolValidator';
import * as R from 'ramda';
import FSM from './FSM';

describe('FSM', () => {
  describe('recognize', () => {
    it('should recognize a really simple language', async () => {
      const fsm = Grammar.fromText(`S -> a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('a')).toBeTruthy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('aa')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaa')).toBeFalsy();
    });

    it('should recognize empty sentence on a really simple language', async () => {
      const fsm = Grammar.fromText(`S -> a | &`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language with multiples ways', async () => {
      const fsm = Grammar.fromText(
        `S -> aC | aB \nB -> aS | a\nC -> aC`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language that has epsilon', async () => {
      const fsm = Grammar.fromText(
        `Z -> aB | ${EPSILON}\nS -> aB\nB -> aS | a`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should NOT recognize even a`s or epsilon on a aa pairs language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('a')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaaa')).toBeFalsy();
    });

    it('should NOT recognize anything on a grammar that generates and empty language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('a')).toBeFalsy();
      expect(await fsm.recognize('aa')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaa')).toBeFalsy();
      expect(await fsm.recognize('aaaaa')).toBeFalsy();
    });
  });

  describe('determination', () => {
    it('should recognize epsilon and non epsilon transactions', async () => {
      const fsm = Grammar.fromText(`S -> aA | b | &\nA -> aA | a`).getFSM();
      expect(fsm).toBeDefined();
      expect(
        fsm.stateHasEpsilonAndNonEpsilonTransactions('S', 'a')
      ).toBeTruthy();
    });

    it('should recognize FSM as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic).toBeTruthy();
    });

    it('should NOT recognize FSM as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aA\nA -> aS | aA | a`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic()).toBeFalsy();
    });

    it('should NOT recognize automata as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aA | b | &\nA -> aA | a`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic()).toBeFalsy();
    });

    it('should recognize loop in automata', async () => {
      const fsm = Grammar.fromText(`S -> aS`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle(fsm.initial)).toBeTruthy();
    });

    it('should recognize cycle in automata', async () => {
      // -> q0 -> q1 -> q2 -> q3
      //    ^           |
      //    |___________|
      const fsm = Grammar.fromText(
        `S -> aA | b\nA -> aB \nC -> aS | b`
      ).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle(fsm.initial)).toBeTruthy();
    });

    it('should NOT recognize cycle in automata', async () => {
      const fsm = Grammar.fromText(`S -> a | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle()).toBeFalsy();
    });

    it('should NOT recognize cycle in automata', async () => {
      const fsm = Grammar.fromText(`S -> a | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle()).toBeFalsy();
    });

    it('should remove epsilon transitions', async() => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON, 'a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'B', when: EPSILON },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: EPSILON },
        { from: 'C', to: 'C', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.eliminateEpsilonTransitions();
      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
    });
  });

  describe('generate', () => {
    it('should accept only integers bigger then 0 and less or equal 100 as max size', async () => {
      const fsm = Grammar.fromText(`S -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(() => fsm.generate(null)).toThrow();
      expect(() => fsm.generate(undefined)).toThrow();
      expect(() => fsm.generate(-1)).toThrow();
      expect(() => fsm.generate(-100)).toThrow();
      expect(() => fsm.generate('10')).toThrow();
      expect(() => fsm.generate(0)).toThrow();
      expect(() => fsm.generate(101)).toThrow();
      expect(() => fsm.generate(1011)).toThrow();
    });

    it('should generate an empty language when the grammar has no final state', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1).length).toEqual(0);
      expect(fsm.generate(10).length).toEqual(0);
      expect(fsm.generate(50).length).toEqual(0);
    });

    it('should generate any amount of a`s on the simple grammar S->aS|a', async () => {
      const fsm = Grammar.fromText(`S -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['a']);
      expect(fsm.generate(2)).toEqual(['a', 'aa']);
      expect(fsm.generate(3)).toEqual(['a', 'aa', 'aaa']);
      expect(fsm.generate(4)).toEqual(['a', 'aa', 'aaa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['a', 'aa', 'aaa', 'aaaa', 'aaaaa']);
      expect(fsm.generate(100).length).toEqual(100);
      expect(R.uniq(fsm.generate(50)).length).toEqual(50);
    });

    it('should generate not generate more sentences then there is on a finite language', async () => {
      const fsm = Grammar.fromText(`S -> a | aB\nB -> a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['a']);
      expect(fsm.generate(2)).toEqual(['a', 'aa']);
      expect(fsm.generate(3)).toEqual(['a', 'aa']);
      expect(fsm.generate(4)).toEqual(['a', 'aa']);
      expect(fsm.generate(5)).toEqual(['a', 'aa']);
      expect(fsm.generate(50)).toEqual(['a', 'aa']);
      expect(fsm.generate(100)).toEqual(['a', 'aa']);
    });

    it('should generate the empty sentence when it have epsilon on the first production', async () => {
      const fsm = Grammar.fromText(
        `S -> aB | a | ${EPSILON}\nB -> aB | a`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['', 'a']);
      expect(fsm.generate(1)).toEqual(['', 'a']);
      expect(fsm.generate(2)).toEqual(['', 'a', 'aa']);
      expect(fsm.generate(3)).toEqual(['', 'a', 'aa', 'aaa']);
      expect(fsm.generate(4)).toEqual(['', 'a', 'aa', 'aaa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['', 'a', 'aa', 'aaa', 'aaaa', 'aaaaa']);
      expect(fsm.generate(50).includes('')).toBeTruthy();
    });

    it('should generate all a`s pairs on the pairs a`s language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual([]);
      expect(fsm.generate(2)).toEqual(['aa']);
      expect(fsm.generate(3)).toEqual(['aa']);
      expect(fsm.generate(4)).toEqual(['aa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['aa', 'aaaa']);
      expect(fsm.generate(6)).toEqual(['aa', 'aaaa', 'aaaaaa']);
    });

    it('should not enter an infinite loop when we have cycles with epsilon transitions', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON];
      const transitions = [
        { from: 'A', to: 'B', when: EPSILON },
        { from: 'B', to: 'C', when: EPSILON },
        { from: 'C', to: 'A', when: EPSILON },
      ];
      const initial = 'A';
      const finals = [];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.generate(1)).toEqual([]);
      expect(fsm.generate(2)).toEqual([]);
      expect(fsm.generate(3)).toEqual([]);
      expect(fsm.generate(4)).toEqual([]);
      expect(fsm.generate(5)).toEqual([]);
      expect(fsm.generate(50)).toEqual([]);
      expect(fsm.generate(100)).toEqual([]);
    });
  });
});

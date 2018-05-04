import Grammar from './Grammar';
import { EPSILON, ACCEPT_STATE } from './SymbolValidator';

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
});

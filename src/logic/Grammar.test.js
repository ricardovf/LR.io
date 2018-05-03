import Grammar from './Grammar';
import { EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('fromText', () => {
    it('should return invalid Grammar when empty text', () => {
      expect(Grammar.fromText('  ').isValid()).toBeFalsy();
      expect(Grammar.fromText('      ').isValid()).toBeFalsy();
      expect(Grammar.fromText('        ').isValid()).toBeFalsy();
      expect(Grammar.fromText('     \n   ').isValid()).toBeFalsy();
      expect(Grammar.fromText('  \r   \n   ').isValid()).toBeFalsy();
    });

    it('should return an invalid grammar on bad formed input', () => {
      expect(Grammar.fromText(`Sa -> a | aS`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S - a`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> S`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S a`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> aSS`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> aa`).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> aB
          B -> S`
        ).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a    |bS | aB
          ç
          B -> b | S`
        ).isValid()
      ).toBeFalsy();
    });

    it('should return an invalid grammar when missing non terminals', () => {
      expect(Grammar.fromText(`S -> aSB`).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | aB
          B->aC|aS`
        ).isValid()
      ).toBeFalsy();
    });

    it('should return valid grammar on simple regular grammar without epsilon', () => {
      // expect(Grammar.fromText(`S -> a | aS`).isValid()).toBeTruthy();
      // expect(Grammar.fromText(`S -> a`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a    |bS | aB

          B -> b | aS`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return valid grammar on simple regular grammar with epsilon', () => {
      expect(Grammar.fromText(`S -> a | ${EPSILON} `).isValid()).toBeTruthy();
      expect(Grammar.fromText(`S -> ${EPSILON}`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a | bB | ${EPSILON}
          B -> b | c`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return an invalid grammar on simple regular grammar with epsilon not on the correct form', () => {
      expect(Grammar.fromText(`S -> aS | ${EPSILON} `).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(`S -> ${EPSILON}${EPSILON}`).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(`${EPSILON} -> a | a${EPSILON}`).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | bB | ${EPSILON}
          B -> b | cS`
        ).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | bB
          B -> b | c | ${EPSILON}`
        ).isValid()
      ).toBeFalsy();
    });
  });
});

import { EPSILON, SPECIAL_NEW_STATE } from '../SymbolValidator';
import FSM from '../FSM';

describe('FSM', () => {
  describe('Epsilon', () => {
    it('should remove epsilon transitions', async () => {
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

    it('should remove epsilon transitions but update the finals states if needed', async () => {
      const states = ['S', 'B', 'O', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'B', when: 'a' },
        { from: 'S', to: 'Z', when: EPSILON },
        { from: 'B', to: 'O', when: 'a' },
        { from: 'B', to: 'S', when: 'a' },
      ];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual(SPECIAL_NEW_STATE);
      expect(fsm.finals).toEqual(SPECIAL_NEW_STATE);
    });

    it('should not remove any transitions', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON, 'a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.eliminateEpsilonTransitions();
      expect(fsm.transitions.length).toEqual(2);
    });
  });
});

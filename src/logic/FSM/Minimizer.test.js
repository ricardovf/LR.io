import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';
import {
  eliminateUnreachableStates,
  eliminateDeadStates,
  detectReachableStates,
  detectAliveStates,
  createPhiState,
  isMinimal
} from './Minimizer';

describe('FSM', () => {
  describe('isMinimal', () => {
    it('should recognize all states as alive and reachable', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q1', to: 'Q2', when: '1' },
        { from: 'Q5', to: 'Q5', when: '1' },
        { from: 'Q0', to: 'Q2', when: '1' },
        { from: 'Q1', to: 'Q1', when: '0' },
        { from: 'Q3', to: 'Q5', when: '0' },
        { from: 'Q3', to: 'Q1', when: '0' },
        { from: 'Q4', to: 'Q3', when: '1' },
        { from: 'Q5', to: 'Q4', when: '0' },
        { from: 'Q4', to: 'Q1', when: '0' },
        { from: 'Q2', to: 'Q3', when: '0' },
        { from: 'Q2', to: 'Q4', when: '1' },
        { from: 'Q0', to: 'Q1', when: '0' },
      ];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      let reachableStates = [fsm.initial];
      let aliveStates = [];
      detectReachableStates(fsm.initial, reachableStates, fsm.transitions);
      for (let final of fsm.finals) {
        detectAliveStates(final, aliveStates, fsm.transitions);
      }
      expect(reachableStates.lenght).toBe(fsm.states.lenght);
      expect(aliveStates.lenght).toBe(fsm.states.lenght);
    });

    it('should eliminate dead and unreachable states', async () => {
      const states = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'G', when: 'a' },
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'F', when: 'a' },
        { from: 'B', to: 'E', when: 'b' },
        { from: 'C', to: 'C', when: 'a' },
        { from: 'C', to: 'G', when: 'b' },
        { from: 'D', to: 'A', when: 'a' },
        { from: 'D', to: 'H', when: 'b' },
        { from: 'E', to: 'E', when: 'a' },
        { from: 'E', to: 'A', when: 'b' },
        { from: 'F', to: 'B', when: 'a' },
        { from: 'F', to: 'C', when: 'b' },
        { from: 'G', to: 'G', when: 'a' },
        { from: 'G', to: 'F', when: 'b' },
        { from: 'H', to: 'H', when: 'a' },
        { from: 'H', to: 'D', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['A', 'G'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      eliminateUnreachableStates(fsm);
      eliminateDeadStates(fsm);
      expect(
        fsm.states
          .slice()
          .sort()
          .join(',')
      ).toBe(
        ['A', 'B', 'C', 'E', 'F', 'G']
          .slice()
          .sort()
          .join(',')
      );
    });

    it('should detect indefinition and create phi state', async () => {
        const states = ['S', 'A', 'BF', 'SF', 'C', 'BSF', 'AC'];
        const alphabet = ['a', 'b', 'c'];
        const transitions = [
          { from: 'S', to: 'A', when: 'a' },
          { from: 'S', to: 'BF', when: 'b' },
          { from: 'S', to: 'SF', when: 'c' },
          { from: 'A', to: 'SF', when: 'a' },
          { from: 'A', to: 'C', when: 'b' },
          { from: 'A', to: 'A', when: 'c' },
          { from: 'BF', to: 'A', when: 'a' },
          { from: 'BF', to: 'BSF', when: 'c' },
          { from: 'SF', to: 'A', when: 'a' },
          { from: 'SF', to: 'BF', when: 'b' },
          { from: 'SF', to: 'SF', when: 'c' },
          { from: 'C', to: 'SF', when: 'a' },
          { from: 'C', to: 'AC', when: 'c' },
          { from: 'BSF', to: 'A', when: 'a' },
          { from: 'BSF', to: 'BF', when: 'b' },
          { from: 'BSF', to: 'BSF', when: 'c' },
          { from: 'AC', to: 'SF', when: 'a' },
          { from: 'AC', to: 'C', when: 'b' },
          { from: 'AC', to: 'AC', when: 'c' }
        ];
        const initial = 'S';
        const finals = ['S', 'BF', 'SF', 'BSF'];
        const fsm = new FSM(states, alphabet, transitions, initial, finals);
        expect(fsm.hasIndefinition()).toBe(true);
        createPhiState(fsm);
        expect(fsm.states.includes('PHI')).toBeTruthy();
    });

    it('should fsm as non minimal', async () => {
        const states = ['S', 'AD', 'E', 'ABD', 'CE', 'ABE'];
        const alphabet = ['0', '1'];
        const transitions = [
          { from: 'S', to: 'AD', when: '0' },
          { from: 'S', to: 'E', when: '1' },
          { from: 'AD', to: 'ABD', when: '0' },
          { from: 'AD', to: 'CE', when: '1' },
          { from: 'E', to: 'E', when: '0' },
          { from: 'E', to: 'E', when: '1' },
          { from: 'ABD', to: 'ABD', when: '0' },
          { from: 'ABD', to: 'CE', when: '1' },
          { from: 'CE', to: 'ABE', when: '0' },
          { from: 'CE', to: 'E', when: '1' },
          { from: 'ABE', to: 'ABE', when: '0' },
          { from: 'ABE', to: 'CE', when: '1' }
        ];
        const initial = 'S';
        const finals = ['E', 'CE', 'ABE'];
        const fsm = new FSM(states, alphabet, transitions, initial, finals);
        expect(isMinimal(fsm)).toBeFalsy();
    });
  });
});

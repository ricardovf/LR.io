import FSM from '../FSM';
import { union, concatenation } from './Operator';

describe('FSM', () => {
  describe('operators', () => {
    it('should unite two FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' }
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0'];
      const alphabet_ = ['a'];
      const transitions_ = [
        { from: 'Q0', to: 'Q0', when: 'a' }
      ];
      const initial_ = 'Q0';
      const finals_ = ['Q0'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = union(fsm, fsm_);
      expect(newFsm.states.length).toBe(3);
    });

    it('should unite two FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' }
      ];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1'];
      const alphabet_ = ['1'];
      const transitions_ = [
        { from: 'Q0', to: 'Q1', when: '1' }
      ];
      const initial_ = 'Q0';
      const finals_ = ['Q1'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = union(fsm, fsm_);
      expect(newFsm.states.length).toBe(3);
    });

    it('should unite two FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' }
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['A', 'B', 'C', 'D'];
      const alphabet_ = ['0', '1'];
      const transitions_ = [
        { from: 'A', to: 'B', when: '0' },
        { from: 'A', to: 'C', when: '1' },
        { from: 'B', to: 'B', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'D', when: '0' },
        { from: 'C', to: 'A', when: '1' },
        { from: 'D', to: 'C', when: '0' },
        { from: 'D', to: 'D', when: '1' }
      ];
      const initial_ = 'A';
      const finals_ = ['B'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = union(fsm, fsm_);
      expect(newFsm.states.length).toBe(7);
    });

    it('should concat two FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' }
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0'];
      const alphabet_ = ['a'];
      const transitions_ = [
        { from: 'Q0', to: 'Q0', when: 'a' }
      ];
      const initial_ = 'Q0';
      const finals_ = ['Q0'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = concatenation(fsm, fsm_);
      expect(newFsm.finals.length).toBe(1);
    });

    it('should unite two FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' }
      ];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1'];
      const alphabet_ = ['1'];
      const transitions_ = [
        { from: 'Q0', to: 'Q1', when: '1' }
      ];
      const initial_ = 'Q0';
      const finals_ = ['Q1'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = concatenation(fsm, fsm_);
      expect(newFsm.finals.length).toBe(1);
    });

    it('should unite two FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' }
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['A', 'B', 'C', 'D'];
      const alphabet_ = ['0', '1'];
      const transitions_ = [
        { from: 'A', to: 'B', when: '0' },
        { from: 'A', to: 'C', when: '1' },
        { from: 'B', to: 'B', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'D', when: '0' },
        { from: 'C', to: 'A', when: '1' },
        { from: 'D', to: 'C', when: '0' },
        { from: 'D', to: 'D', when: '1' }
      ];
      const initial_ = 'A';
      const finals_ = ['B'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = concatenation(fsm, fsm_);
      expect(newFsm.finals.length).toBe(1);
    });
  });
});

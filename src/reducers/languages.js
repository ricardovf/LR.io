import actions from '../actions';
import defaultStore from '../store/exemple';

export default (state = [], action) => {
  switch (action.type) {
    case actions.FETCH_LANGUAGES:
      // @todo load from localstore?
      return [...state, ...defaultStore.languages];
    case actions.CREATE_LANGUAGE:
      return [
        ...state,
        {
          name: `Nova linguagem #${state.length}`,
        },
      ];
    case actions.EDIT_GRAMMAR:
      return [...state];
    default:
      return state;
  }
};

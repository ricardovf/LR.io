import actions from '../actions';

export default (state = [], action) => {
  switch (action.type) {
    case actions.FETCH_LANGUAGES:
      return [
        {
          name: 'aaabbb com b par',
        },
        {
          name: 'bbbb com b divisível por 3',
        },
        {
          name: 'binários sem 000',
        },
      ];
    default:
      return state;
  }
};

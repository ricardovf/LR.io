import actions from '../actions';

export default (state = null, action) => {
  switch (action.type) {
    case actions.SELECT_LANGUAGE:
      console.log('selecting language: ' + action.index);
      return action.index;
    default:
      return state;
  }
};

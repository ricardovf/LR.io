import actions from '../actions';

export default (state = null, action) => {
  switch (action.type) {
    case actions.SELECT_LANGUAGE:
      return action.id;
    default:
      return state;
  }
};

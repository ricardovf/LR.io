export default {
  state: null, // initial state
  reducers: {
    // handle state changes with pure functions
    select(state, { id }) {
      console.log('selected ' + id);
      // @todo check if id is valid?
      return id;
    },
  },
};

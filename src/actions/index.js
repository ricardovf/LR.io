export const actions = {
  CREATE_LANGUAGE: 'CREATE_LANGUAGE',
  SELECT_LANGUAGE: 'SELECT_LANGUAGE',
  DELETE_LANGUAGE: 'DELETE_LANGUAGE',
  EDIT_GRAMMAR: 'EDIT_GRAMMAR',
};

export default actions;

export const editGrammar = (id, text) => {
  return {
    type: actions.EDIT_GRAMMAR,
    id,
    text,
  };
};

export const selectLanguage = id => {
  return {
    type: actions.SELECT_LANGUAGE,
    id,
  };
};

export const deleteLanguage = id => {
  console.log('requested to delete ' + id);
  return {
    type: actions.DELETE_LANGUAGE,
    id,
  };
};

// @todo and then select the language
export const newLanguage = () => {
  return {
    type: actions.CREATE_LANGUAGE,
  };
};

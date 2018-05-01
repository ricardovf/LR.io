export const actions = {
  EDIT_GRAMMAR: 'INCREMENT_COUNTER',
  CREATE_LANGUAGE: 'CREATE_LANGUAGE',
  FETCH_LANGUAGES: 'FETCH_LANGUAGES',
  SELECT_LANGUAGE: 'SELECT_LANGUAGE',
};

export default actions;

export const editGrammar = (index, grammar) => {
  return {
    type: actions.EDIT_GRAMMAR,
    index,
    grammar,
  };
};

export const selectLanguage = index => {
  return {
    type: actions.SELECT_LANGUAGE,
    index: index,
  };
};

// @todo and then select the language
export const newLanguage = () => {
  return {
    type: actions.CREATE_LANGUAGE,
  };
};

export const fetchLanguages = () => {
  return {
    type: actions.FETCH_LANGUAGES,
  };
};

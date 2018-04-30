export const actions = {
  CREATE_LANGUAGE: 'CREATE_LANGUAGE',
  INCREMENT_COUNTER: 'INCREMENT_COUNTER',
  FETCH_LANGUAGES: 'FETCH_LANGUAGES',
};

export default actions;

export const incrementCounter = increment => {
  return {
    type: actions.INCREMENT_COUNTER,
    increment,
  };
};

export const newLanguage = () => {
  return {
    type: actions.CREATE_LANGUAGE,
  };
};

export const fetchLanguages = increment => {
  return {
    type: actions.FETCH_LANGUAGES,
  };
};

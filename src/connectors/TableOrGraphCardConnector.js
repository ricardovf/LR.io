import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import TableOrGraphCard from '../components/TableOrGraphCard';
import { find, propEq } from 'ramda';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);

  return {
    view: state.FSMViewType,
    fsm: language !== undefined ? language.fsm : undefined,
  };
};

const mapDispatch = dispatch => ({
  alternateView: () => dispatch.FSMViewType.alternate(),
});

export default connect(mapState, mapDispatch)(TableOrGraphCard);

import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import ListSubheader from 'material-ui/List/ListSubheader';
import { withStyles } from 'material-ui/styles/index';
import { connect } from 'react-redux';
import { newLanguage, fetchLanguages } from '../actions';

class LanguagesMenuList extends React.Component {
  componentWillMount() {
    this.props.fetchLanguages();
  }

  render() {
    const listItems = this.props.languages.map(item => (
      <ListItem button>
        <ListItemText primary={item.name} />
      </ListItem>
    ));

    return (
      <List
        subheader={
          <ListSubheader component="div">Linguagens regulares</ListSubheader>
        }
      >
        {listItems}

        <ListItem>
          <Button variant="raised" color="primary" onClick={this.props.onClick}>
            Nova
          </Button>
        </ListItem>
      </List>
    );
  }
}

LanguagesMenuList.propTypes = {
  languages: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  languages: state.languages,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    dispatch(newLanguage());
  },
  fetchLanguages: () => {
    dispatch(fetchLanguages());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesMenuList);

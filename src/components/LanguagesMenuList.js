import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import ListSubheader from 'material-ui/List/ListSubheader';

class LanguagesMenuList extends React.Component {
  componentWillMount() {
    this.props.fetchLanguages();
  }

  render() {
    const listItems = this.props.languages.map((item, index) => (
      <ListItem
        button
        key={item.name}
        onClick={() => {
          this.props.selectLanguageOnClick(index);
        }}
      >
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
          <Button
            variant="raised"
            color="primary"
            onClick={this.props.newLanguageOnClick}
          >
            Nova
          </Button>
        </ListItem>
      </List>
    );
  }
}

LanguagesMenuList.propTypes = {
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    })
  ),
  fetchLanguages: PropTypes.func.isRequired,
  selectLanguageOnClick: PropTypes.func.isRequired,
  newLanguageOnClick: PropTypes.func.isRequired,
};

export default LanguagesMenuList;

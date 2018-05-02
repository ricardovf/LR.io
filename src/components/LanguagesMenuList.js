import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import ListSubheader from 'material-ui/List/ListSubheader';
import { Icon, withStyles } from 'material-ui';

const isSelected = (item, language) =>
  language !== undefined && language.id === item.id;

class LanguagesMenuList extends React.Component {
  render() {
    const {
      language,
      languages,
      classes,
      selectLanguageOnClick,
      newLanguageOnClick,
    } = this.props;

    const listItems = languages.map(item => (
      <ListItem
        button
        key={item.id}
        onClick={() => {
          selectLanguageOnClick(item.id);
        }}
      >
        <ListItemText
          primary={(isSelected(item, language) ? '→ ' : '') + item.name}
        />
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
          <Button variant="raised" color="primary" onClick={newLanguageOnClick}>
            Nova linguagem
          </Button>
        </ListItem>
      </List>
    );
  }
}

LanguagesMenuList.propTypes = {
  language: PropTypes.object,
  languages: PropTypes.array.isRequired,
  selectLanguageOnClick: PropTypes.func.isRequired,
  newLanguageOnClick: PropTypes.func.isRequired,
};

const styles = theme => ({});

export default withStyles(styles, { withTheme: true })(LanguagesMenuList);

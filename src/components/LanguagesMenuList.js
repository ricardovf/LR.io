import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import ListSubheader from 'material-ui/List/ListSubheader';
import { withStyles } from 'material-ui';

const isSelected = (item, language) =>
  language !== undefined && language.id === item.id;

const styles = theme => ({
  selected: {
    background: theme.palette.secondary.main,
    '& h3': {
      color: theme.palette.secondary.contrastText,
    },
    '&:hover': {
      background: theme.palette.secondary.main,
    },
  },
});

class LanguagesMenuList extends React.Component {
  render() {
    const {
      classes,
      language,
      languages,
      selectLanguageOnClick,
      newLanguageOnClick,
    } = this.props;

    const listItems = languages.map(item => (
      <ListItem
        className={isSelected(item, language) ? classes.selected : undefined}
        button
        key={item.id}
        onClick={selectLanguageOnClick.bind(this, item.id)}
      >
        <ListItemText primary={item.name} />
      </ListItem>
    ));

    return (
      <List
        subheader={
          languages && languages.length > 0 ? (
            <ListSubheader component="div">Linguagens regulares</ListSubheader>
          ) : (
            undefined
          )
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

export default withStyles(styles, { withTheme: true })(LanguagesMenuList);

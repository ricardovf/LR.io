import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { Icon, IconButton, Toolbar, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
  },
});

class MainToolbar extends React.Component {
  render() {
    const { classes, language, handleDrawerToggle, deleteOnClick } = this.props;

    const buttons = language && (
      <React.Fragment>
        <Button color="inherit">Operações</Button>
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
            deleteOnClick(language.id);
          }}
        >
          <Icon>delete</Icon>
        </IconButton>
      </React.Fragment>
    );

    return (
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          className={classes.navIconHide}
        >
          <Icon>menu</Icon>
        </IconButton>
        <Typography
          style={{ flex: '1 0 auto' }}
          variant="title"
          color="inherit"
          noWrap
        >
          {language && language.name}
        </Typography>
        {buttons}
      </Toolbar>
    );
  }
}

MainToolbar.propTypes = {
  language: PropTypes.object,
  handleDrawerToggle: PropTypes.func.isRequired,
  deleteOnClick: PropTypes.func.isRequired,
  // onRename: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(MainToolbar);

import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { Icon, IconButton, Input, Toolbar, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import SymbolValidator from '../logic/SymbolValidator';
import Tooltip from 'material-ui/Tooltip';

const styles = theme => ({
  input: {
    color: 'white',
  },
});

class RenameLanguage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
    };
  }

  render() {
    const { classes, language, renameLanguage } = this.props;

    const isFocused = this.state.isFocused;
    const isEmpty =
      language === undefined ||
      (typeof language.name === 'string' && language.name.trim().length === 0);

    return (
      <Tooltip title="Renomear a linguagem" placement="button">
        <Input
          disableUnderline
          // fullWidth
          placeholder="Nome da linguagem"
          margin="none"
          className={classes.input}
          value={isFocused ? undefined : isEmpty ? '' : language.name}
          onChange={event => {
            renameLanguage(
              language ? language.id : undefined,
              event.target.value
            );
          }}
          onBlur={event => {
            this.setState({ isFocused: false });
          }}
          onFocus={event => {
            this.setState({ isFocused: true });
          }}
          onKeyPress={event => {
            if (event.key === 'Enter') {
              event.target.blur();
            }
          }}
        />
      </Tooltip>
    );
  }
}

RenameLanguage.propTypes = {
  language: PropTypes.object,
  renameLanguage: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(RenameLanguage);

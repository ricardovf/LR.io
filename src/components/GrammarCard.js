import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';

class GrammarCard extends React.Component {
  render() {
    const { classes, grammarText, valid = true, onGrammarChange } = this.props;

    const isEmpty =
      grammarText === undefined ||
      (typeof grammarText === 'string' && grammarText.length === 0);

    const input = (
      <TextField
        error={!isEmpty && !valid}
        id="multiline-flexible"
        label=""
        multiline
        rowsMax="10"
        className={classes.textField}
        defaultValue={grammarText}
        onChange={event => {
          if (onGrammarChange) onGrammarChange(event.target.value);
        }}
        placeholder="S -> a | aS"
        fullWidth
        margin="normal"
      />
    );

    return (
      <Card>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Gramática regular
          </Typography>
          <form noValidate autoComplete="off">
            <FormControl
              fullWidth
              error={!isEmpty && !valid}
              aria-describedby={!valid ? 'grammar-error-text' : ''}
            >
              {input}
              {!isEmpty &&
                !valid && (
                  <FormHelperText id="grammar-error-text">
                    Gramática inválida ou não regular
                  </FormHelperText>
                )}
            </FormControl>
          </form>
        </CardContent>
      </Card>
    );
  }
}

GrammarCard.propTypes = {
  classes: PropTypes.object.isRequired,
  grammarText: PropTypes.string,
  valid: PropTypes.bool,
  onGrammarChange: PropTypes.func,
};

export default withStyles({})(GrammarCard);

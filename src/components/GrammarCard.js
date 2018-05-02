import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';

class GrammarCard extends React.Component {
  render() {
    const { language, grammar, valid = true, onGrammarChange } = this.props;

    const isEmpty =
      grammar === undefined ||
      (typeof grammar === 'string' && grammar.length === 0);

    const input = (
      <TextField
        error={!isEmpty && !valid}
        id="multiline-flexible"
        label=""
        multiline
        rowsMax="10"
        defaultValue={isEmpty ? '' : grammar}
        onChange={event => {
          if (onGrammarChange)
            onGrammarChange(
              language ? language.id : undefined,
              event.target.value
            );
        }}
        onBlur={event => {}}
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
  grammar: PropTypes.string,
  valid: PropTypes.bool,
  onGrammarChange: PropTypes.func,
};

export default withStyles({})(GrammarCard);

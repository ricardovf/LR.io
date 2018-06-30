import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import FSM from '../logic/FSM';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import * as R from 'ramda';
import Tooltip from 'material-ui/Tooltip';

const styles = () => ({
  card: {
    height: '100%',
  },
  form: {
    float: 'right',
  },
});

class EnumerationCard extends React.Component {
  constructor(props) {
    super(props);

    // We keep sentences local cause we do not want to full our store with generated sentences
    this.state = {
      sentences: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { language, length } = nextProps;

    // try to generate the sentences and update sentences in state
    if (language) {
      let sentences = [];

      if (language && language.fsm) {
        const fsm = FSM.fromPlainObject(language.fsm);

        if (fsm) {
          sentences = R.filter(s => {
            return s.length === length;
          }, fsm.generate(length)).sort();
        }
      }

      // Update the current state with new sentences
      return {
        sentences,
      };
    }

    // React expects us to return null if nothing changes
    return null;
  }

  render() {
    const { classes, language, length, onLengthChange } = this.props;

    let Sentences = this.state.sentences.join(', ');

    /** @type {FSM} */
    let fsm = null;

    if (language && language.fsm) {
      fsm = FSM.fromPlainObject(language.fsm);
    }

    if (length === 0) {
      Sentences = fsm
        ? fsm.acceptsEmptySentence()
          ? 'Aceita a sentença vazia.'
          : 'Não aceita a sentença vazia.'
        : '';
    }

    return (
      <Card className={classes.card}>
        <CardContent>
          <FormControl className={classes.form}>
            <Tooltip title="Sentenças com tamanho exato" placement="left-start">
              <Select
                native
                onChange={event =>
                  onLengthChange(language.id, event.target.value)
                }
                value={length}
              >
                {R.range(0, 101).map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Tooltip>
          </FormControl>
          <Typography gutterBottom variant="headline" component="h2">
            Enumeração
          </Typography>
          <Typography gutterBottom variant="body1" component="p">
            {Sentences}
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

EnumerationCard.propTypes = {
  language: PropTypes.object,
  length: PropTypes.number,
  onLengthChange: PropTypes.func,
};

export default withStyles(styles)(EnumerationCard);

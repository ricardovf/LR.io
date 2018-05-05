import React from 'react';
import PropTypes from 'prop-types';
import { Input, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import * as R from 'ramda';
import Radio from 'material-ui/Radio';
import TextField from 'material-ui/TextField';
const NEW_SYMBOL = 'Novo símbolo';
const NEW_STATE = 'Novo estado';

const styles = () => ({
  card: {
    height: '100%',
  },
  container: {
    overflowX: 'auto',
  },
  minimalCell: {
    padding: 0,
    'text-align': 'center',
  },
  newRow: {
    background: '#ffffe5',
  },
  tableInput: {
    padding: '0',
    marginBottom: '-4px',
    fontWeight: 'normal',
  },
});

class TransitionTableCard extends React.Component {
  buildHeader(fsm) {
    let data = ['*', 'F', 'Estado'];

    if (fsm && Array.isArray(fsm.alphabet)) {
      data = [...data, ...fsm.alphabet];
    }

    // new symbol
    data.push(NEW_SYMBOL);

    return data;
  }

  buildData(fsm) {
    const data = [];
    let newAlphabet = [];

    if (fsm && Array.isArray(fsm.states)) {
      if (Array.isArray(fsm.alphabet)) {
        fsm.alphabet.forEach(symbol => {
          newAlphabet[symbol] = '';
        });
      }

      for (const state of fsm.states) {
        const alphabet = {};

        if (Array.isArray(fsm.alphabet)) {
          fsm.alphabet.forEach(symbol => {
            let to = [];
            const transitions = R.filter(
              R.whereEq({ from: state, when: symbol })
            )(fsm.transitions);

            if (transitions.length) {
              to = [...to, ...R.pluck('to')(transitions)];
            }

            alphabet[symbol] =
              to.length === 0
                ? '–'
                : R.uniq(to)
                    .sort()
                    .join(', ');
          });
        }

        const line = {
          state,
          initial: fsm.initial === state,
          final: Array.isArray(fsm.finals) && fsm.finals.includes(state),
          ...alphabet,
          [NEW_SYMBOL]: '',
        };

        data.push(line);
      }
    }

    // new
    newAlphabet[NEW_SYMBOL] = '';

    const line = {
      state: NEW_STATE,
      initial: false,
      final: false,
      ...newAlphabet,
    };

    data.push(line);

    return data;
  }

  render() {
    const {
      classes,
      language,
      fsm,
      changeInitialState,
      addToFinalStates,
      deleteFromFinalStates,
    } = this.props;

    const data = this.buildData(fsm);
    const header = this.buildHeader(fsm);

    let newStateInput = (
      <Input
        disableUnderline
        fullWidth
        placeholder="Novo estado"
        margin="none"
        className={classes.tableInput}
      />
    );

    let newSymbolInput = (
      <Input
        disableUnderline
        fullWidth
        placeholder="Novo símbolo"
        margin="none"
        className={classes.tableInput}
      />
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Tabela de transições
          </Typography>

          <div className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  {header.map((h, index) => {
                    return (
                      <TableCell
                        key={index}
                        className={index < 2 ? classes.minimalCell : ''}
                        padding="dense"
                      >
                        {h === NEW_SYMBOL ? newSymbolInput : h}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t, index) => {
                  return (
                    <TableRow
                      hover
                      key={index}
                      className={
                        t.state === NEW_STATE ? classes.newRow : undefined
                      }
                    >
                      <TableCell
                        padding="checkbox"
                        className={classes.minimalCell}
                      >
                        {t.state !== NEW_STATE && (
                          <Radio
                            checked={t.initial}
                            onChange={event => {
                              changeInitialState(language.id, t.state);
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        className={classes.minimalCell}
                      >
                        {t.state !== NEW_STATE && (
                          <Checkbox
                            checked={t.final}
                            onChange={event => {
                              if (event.target.checked) {
                                addToFinalStates(language.id, t.state);
                              } else {
                                deleteFromFinalStates(language.id, t.state);
                              }
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell padding="dense">
                        {t.state === NEW_STATE ? newStateInput : t.state}
                      </TableCell>
                      {header.slice(3).map((h, index) => {
                        return (
                          <TableCell key={index} padding="dense">
                            {t[h]}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
}

TransitionTableCard.propTypes = {
  classes: PropTypes.object.isRequired,
  fsm: PropTypes.object,
  valid: PropTypes.bool,
  changeInitialState: PropTypes.func,
  addToFinalStates: PropTypes.func,
  deleteFromFinalStates: PropTypes.func,
};

export default withStyles(styles)(TransitionTableCard);

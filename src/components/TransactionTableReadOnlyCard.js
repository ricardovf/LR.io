import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography } from 'material-ui';
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
});

class TransactionTableReadOnlyCard extends React.Component {
  buildHeader(fsm) {
    let data = ['*', 'F', 'Estado'];

    if (fsm && Array.isArray(fsm.alphabet)) {
      data = [...data, ...fsm.alphabet];
    }

    return data;
  }

  buildData(fsm) {
    const data = [];

    if (fsm && Array.isArray(fsm.states)) {
      for (const state of fsm.states) {
        const alphabet = {};

        if (Array.isArray(fsm.alphabet)) {
          fsm.alphabet.map(symbol => {
            let to = [];
            const transactions = R.filter(
              R.whereEq({ from: state, when: symbol })
            )(fsm.transactions);

            if (transactions.length) {
              to = [...to, ...R.pluck('to')(transactions)];
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
        };

        data.push(line);
      }
    }

    return data;
  }

  render() {
    const { classes, language, fsm, valid = true } = this.props;

    const data = this.buildData(fsm);
    const header = this.buildHeader(fsm);

    const checkIcon = (
      <Icon style={{ fontSize: 18, color: 'green' }}>check</Icon>
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
                        {h}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell
                        padding="checkbox"
                        className={classes.minimalCell}
                      >
                        <Radio checked={t.initial} />
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        className={classes.minimalCell}
                      >
                        <Checkbox checked={t.final} />
                      </TableCell>
                      <TableCell padding="dense">{t.state}</TableCell>
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

TransactionTableReadOnlyCard.propTypes = {
  classes: PropTypes.object.isRequired,
  fsm: PropTypes.object,
  valid: PropTypes.bool,
};

export default withStyles(styles)(TransactionTableReadOnlyCard);

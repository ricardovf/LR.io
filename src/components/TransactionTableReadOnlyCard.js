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
import * as R from 'ramda';

const styles = theme => ({
  container: {
    overflowX: 'auto',
  },
  table: {
    // minWidth: 700,
  },
});

let id = 0;
function createData(name, calories, fat, carbs, protein) {
  id += 1;
  return { id, name, calories, fat, carbs, protein };
}

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
                ? '-'
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

    const debug = fsm && (
      <Typography variant="caption">
        <div>Initial: {JSON.stringify(fsm.initial)}</div>
        <div>Finals: {JSON.stringify(fsm.finals)}</div>
        <div>Alphabet: {JSON.stringify(fsm.alphabet)}</div>
        <div>States: {JSON.stringify(fsm.states)}</div>
        <div>Transactions: {JSON.stringify(fsm.transactions)}</div>
      </Typography>
    );

    return (
      <Card>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Tabela de transições
          </Typography>

          {debug}

          <div className={classes.container}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  {header.map(h => {
                    return <TableCell>{h}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {t.initial ? <Icon>check</Icon> : '–'}
                      </TableCell>
                      <TableCell>
                        {t.final ? <Icon>check</Icon> : '–'}
                      </TableCell>
                      <TableCell>{t.state}</TableCell>
                      {header.slice(3).map(h => {
                        return <TableCell>{t[h]}</TableCell>;
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
  fsm: PropTypes.string,
  valid: PropTypes.bool,
};

export default withStyles(styles)(TransactionTableReadOnlyCard);

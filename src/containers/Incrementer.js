import React from 'react';
import PropTypes from 'prop-types';
import { incrementCounter } from '../actions';
import { connect } from 'react-redux';
import { Button, CardActions, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';

const Incrementer = ({ classes, theme, value, onClick }) => {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="headline" component="h2">
          Incrementador
        </Typography>
        <Typography component="p">Valor atual: {value}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Increment
        </Button>
      </CardActions>
    </Card>
  );
};

Incrementer.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  value: state.incrementer.value,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    dispatch(incrementCounter(1));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles({})(Incrementer)
);

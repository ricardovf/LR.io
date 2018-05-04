import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';

const styles = () => ({
  card: {
    height: '100%',
  },
  lastList: {
    'padding-bottom': 0,
  },
});

class FSMCard extends React.Component {
  render() {
    const { classes, language, fsm, valid = true } = this.props;

    const yesIcon = <Icon style={{ fontSize: 24, color: 'green' }}>check</Icon>;
    const noIcon = <Icon style={{ fontSize: 24, color: 'red' }}>close</Icon>;

    const info = fsm && (
      <React.Fragment>
        <List dense>
          <ListItem disableGutters>
            <ListItemText secondary="Estados" primary={fsm.states.join(', ')} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary="Alfabeto"
              primary={fsm.alphabet.join(', ')}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText secondary="Estado inicial" primary={fsm.initial} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary="Estado final"
              primary={fsm.finals.join(', ')}
            />
          </ListItem>
        </List>
        <Divider />
        <List dense className={classes.lastList}>
          <ListItem disableGutters>
            <ListItemIcon>{yesIcon}</ListItemIcon>
            <ListItemText primary="Determinístico" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>{yesIcon}</ListItemIcon>
            <ListItemText primary="Transições por epsilon" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>{noIcon}</ListItemIcon>
            <ListItemText primary="Mínimo" />
          </ListItem>
        </List>
      </React.Fragment>
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Autômato finito
          </Typography>

          {info}
        </CardContent>
      </Card>
    );
  }
}

FSMCard.propTypes = {
  classes: PropTypes.object.isRequired,
  fsm: PropTypes.object,
  valid: PropTypes.bool,
};

export default withStyles(styles)(FSMCard);

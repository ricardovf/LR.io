import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import FSMGraph from '../components/FSMGraph';
import EditableTransitionTableConnected from '../connectors/EditableTransitionTableConnected';

import IconButton from 'material-ui/IconButton';
import CodeDialog from './CodeDialog';

const styles = () => ({
  card: {
    height: '100%',
  },
  icons: {
    float: 'right',
  },
  icon: {
    marginLeft: '6px',
    width: '24px',
    height: '24px',
    '& > span > span': {
      fontSize: '16px',
    },
  },
});

class TableOrGraphCard extends React.Component {
  render() {
    const { classes, view = 'table', alternateView, fsm } = this.props;

    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.icons}>
            {fsm && (
              <React.Fragment>
                <Tooltip title="Alternar entre gráfico e tabela">
                  <IconButton
                    className={classes.icon}
                    aria-label="generate-code-for-fsm"
                    onClick={alternateView}
                  >
                    <Icon color={view === 'table' ? undefined : 'primary'}>
                      bubble_chart
                    </Icon>
                  </IconButton>
                </Tooltip>
                {<CodeDialog fsm={fsm} />}
              </React.Fragment>
            )}
          </div>
          {view === 'graph' ? (
            <FSMGraph fsm={fsm} />
          ) : (
            <EditableTransitionTableConnected />
          )}
        </CardContent>
      </Card>
    );
  }
}

TableOrGraphCard.propTypes = {
  classes: PropTypes.object.isRequired,
  view: PropTypes.string,
  alternateView: PropTypes.func,
};

export default withStyles(styles)(TableOrGraphCard);
import React from 'react';
import { withStyles } from 'material-ui/styles';

import Viz from 'viz.js';
import { Typography } from 'material-ui';

const styles = () => ({
  graphContainer: {
    overflow: 'auto',
    maxHeight: '1200px',
    maxWidth: '100%',
  },
});

class FSMGraph extends React.Component {
  renderDiagram(fsm) {
    if (!fsm || !Array.isArray(fsm.states) || fsm.states.length === 0)
      return '';

    let graph = `
      digraph fsm {
        rankdir=LR;
        size="8,5"
        node [shape = doublecircle]; ${fsm.finals.join(' ')};
        node [shape = point ]; start
        start -> ${fsm.initial}
        node [shape = circle];
        ${fsm.transitions
          .map(
            transition =>
              `${transition.from} -> ${transition.to} [ label = "${
                transition.when
              }" ];`
          )
          .join('\n')}
      }`;

    return (
      <div
        dangerouslySetInnerHTML={{
          __html: Viz(graph, { format: 'svg', engine: 'dot' }),
        }}
      />
    );
  }

  render() {
    const { classes, fsm = null } = this.props;

    // Gotta return a div, otherwise React goes crazy with viz.js
    return (
      <div>
        <Typography gutterBottom variant="headline" component="h2">
          Grafo
        </Typography>

        <div className={classes.graphContainer}>{this.renderDiagram(fsm)}</div>
      </div>
    );
  }
}

export default withStyles(styles)(FSMGraph);

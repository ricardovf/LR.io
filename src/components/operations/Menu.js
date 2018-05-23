import React from 'react';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import SelfOperationDialog from './SelfOperationDialog';
import {
  cloneFSMWithSteps,
  closureWithSteps,
  concatenationWithSteps,
  differenceWithSteps,
  intersectionWithSteps,
  negationWithSteps,
  reverseWithSteps,
  unionWithSteps,
} from '../../logic/FSM/Operator';
import TwoLanguagesOperationDialog from './TwoLanguagesOperationDialog';

class OperationsMenu extends React.Component {
  state = {
    anchorEl: null,
    operation: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  makeOperationHandler = operation => {
    return event => {
      this.setState({ anchorEl: null, operation });
    };
  };

  handleClose = () => {
    this.setState({ anchorEl: null, operation: null });
  };

  render() {
    const { anchorEl, operation } = this.state;
    const { language, languages, handleSave } = this.props;

    if (!language || !language.fsm) {
      return '';
    }

    return (
      <div>
        <SelfOperationDialog
          title="Complemento"
          subtitle="Complementando"
          open={operation === 'negation'}
          operation={negationWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Reverso"
          subtitle="Revertendo"
          open={operation === 'reverse'}
          operation={reverseWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Fechamento"
          subtitle="Fechando"
          operation={closureWithSteps}
          open={operation === 'closure'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Clonar"
          subtitle="Clonando"
          open={operation === 'clone'}
          operation={cloneFSMWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <TwoLanguagesOperationDialog
          title="Concatenação"
          subtitle="Concatenando"
          actionSubtitle="concatenar com"
          operation={concatenationWithSteps}
          open={operation === 'concatenation'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="Diferença"
          subtitle="Diferenciando"
          actionSubtitle="calcular a diferença de"
          operation={differenceWithSteps}
          open={operation === 'difference'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="União"
          subtitle="Unindo"
          actionSubtitle="unir com"
          operation={unionWithSteps}
          open={operation === 'union'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="Interseção"
          subtitle="interseccionando"
          actionSubtitle="intersectar com"
          operation={intersectionWithSteps}
          open={operation === 'intersection'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <Button
          color="inherit"
          aria-owns={anchorEl ? 'operations-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          Operações
        </Button>
        <Menu
          id="operations-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.makeOperationHandler('concatenation')}>
            Concatenar
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('difference')}>
            Diferença
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('union')}>Unir</MenuItem>
          <MenuItem onClick={this.makeOperationHandler('intersection')}>
            Interseção
          </MenuItem>
          <Divider />
          <MenuItem onClick={this.makeOperationHandler('negation')}>
            Complemento
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('reverse')}>
            Reverso
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('closure')}>
            Fechamento
          </MenuItem>
          <Divider />
          <MenuItem onClick={this.makeOperationHandler('clone')}>
            Clonar
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default OperationsMenu;

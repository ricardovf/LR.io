import React from 'react';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import SelfOperationDialog from './SelfOperationDialog';
import { reverseWithSteps } from '../../logic/FSM/Operator';

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
    const { language, handleSave } = this.props;

    if (!language || !language.fsm) {
      return '';
    }

    return (
      <div>
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
          operation={undefined}
          open={operation === 'star'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
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
          <MenuItem onClick={this.makeOperationHandler('concat')}>
            Concatenar
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('difference')}>
            Subtrair
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('union')}>Unir</MenuItem>
          <MenuItem onClick={this.makeOperationHandler('intersection')}>
            Interseção
          </MenuItem>
          <Divider />
          <MenuItem onClick={this.makeOperationHandler('reverse')}>
            Reverso
          </MenuItem>
          <MenuItem onClick={this.makeOperationHandler('star')}>
            Fechamento
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default OperationsMenu;

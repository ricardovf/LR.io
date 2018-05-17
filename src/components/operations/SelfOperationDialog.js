import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import { Icon } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import IconButton from 'material-ui/IconButton';
import { reverseWithSteps } from '../../logic/FSM/Operator';
import FSM from '../../logic/FSM';
import FSMGraph from '../FSMGraph';
import * as R from 'ramda';
import PropTypes from 'prop-types';

const styles = () => ({});

class SelfOperationDialog extends React.Component {
  state = {
    steps: undefined,
    step: undefined,
  };

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveAndClose = this.handleSaveAndClose.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let reset = false;
    if (
      nextProps.open === false ||
      !nextProps.language ||
      !nextProps.language.fsm
    ) {
      reset = true;
    } else if (nextProps.open === true) {
      let reverseSteps = reverseWithSteps(
        FSM.fromPlainObject(nextProps.language.fsm)
      );
      if (reverseSteps.length > 0) {
        reverseSteps = R.map(fsm => fsm.toPlainObject(), reverseSteps);
        return {
          steps: reverseSteps,
          step: 1,
        };
      } else {
        reset = true;
      }
    }

    if (reset)
      return {
        steps: undefined,
        step: undefined,
      };

    return null;
  }

  handleNext() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.step + 1 });
    }
  }

  handleSaveAndClose() {
    const { language, title, handleCancel, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps))
      handleSave(
        language.id,
        language.name + ` (${title})`,
        this.state.steps[this.state.step - 1],
        true
      );

    if (handleCancel) handleCancel();
  }

  handleSave() {
    const { language, title, handleCancel, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps))
      handleSave(
        language.id,
        language.name + ` (${title} - Passo ${this.state.step})`,
        this.state.steps[this.state.step - 1],
        false
      );
  }

  render() {
    const { classes, title, subtitle, language, handleCancel } = this.props;

    let actionButton = (
      <Button onClick={this.handleNext} color="primary" autoFocus>
        Próximo
      </Button>
    );

    let saveButton;

    if (Array.isArray(this.state.steps)) {
      if (this.state.step === this.state.steps.length)
        actionButton = (
          <Button onClick={this.handleSaveAndClose} color="primary" autoFocus>
            Salvar
          </Button>
        );
      else if (this.state.steps.length > 1)
        saveButton = (
          <Button onClick={this.handleSave} color="primary">
            Salvar intermediário
          </Button>
        );
    }

    return (
      <Dialog
        open={this.props.open}
        onClose={handleCancel}
        aria-labelledby="dialog-operation-title"
        aria-describedby="dialog-operation-description"
      >
        <DialogTitle id="dialog-operation-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-operation-description">
            {subtitle} <strong>{language.name}</strong>
          </DialogContentText>
          {Array.isArray(this.state.steps) && (
            <div>
              <FSMGraph
                showTitle={false}
                fsm={this.state.steps[this.state.step - 1]}
              />
              <div>
                Passo {this.state.step} de {this.state.steps.length}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancelar
          </Button>
          {saveButton}
          {actionButton}
        </DialogActions>
      </Dialog>
    );
  }
}

SelfOperationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
  handleCancel: PropTypes.func,
  handleSave: PropTypes.func,
};

export default withStyles(styles)(SelfOperationDialog);

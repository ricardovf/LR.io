import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Icon } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import ChipInput from 'material-ui-chip-input';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

const styles = () => ({
  card: {
    height: '100%',
  },
  greenAvatar: {
    color: '#fff',
    backgroundColor: 'green',
  },
  redAvatar: {
    color: '#fff',
    backgroundColor: 'red',
  },
  avatarIcon: {
    fontSize: '16px',
  },
});

class RecognizeCard extends React.Component {
  render() {
    const {
      classes,
      language,
      sentences,
      acceptedSentences = [],
      onSentenceAdd,
      onSentenceDelete,
    } = this.props;

    const hasLanguage = language !== undefined;

    const chipRenderer = (
      { value, isFocused, isDisabled, handleClick, handleDelete, defaultStyle },
      key
    ) => (
      <Chip
        style={{
          ...defaultStyle,
          marginBottom: '8px',
          marginRight: '8px',
          // pointerEvents: isDisabled ? 'none' : undefined,
        }}
        onClick={handleClick}
        onDelete={handleDelete}
        label={value}
        key={key}
        avatar={
          <Avatar
            className={
              acceptedSentences.includes(value)
                ? classes.greenAvatar
                : classes.redAvatar
            }
          >
            <Icon className={classes.avatarIcon}>
              {acceptedSentences.includes(value) ? 'check' : 'warning'}
            </Icon>
          </Avatar>
        }
      />
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Reconhecimento
          </Typography>
          {hasLanguage && (
            <ChipInput
              fullWidth
              fullWidthInput
              placeholder="Ex: aabb"
              value={sentences}
              onAdd={chipText => {
                onSentenceAdd(language.id, chipText);
              }}
              onDelete={chipText => {
                onSentenceDelete(language.id, chipText);
              }}
              chipRenderer={chipRenderer}
            />
          )}
        </CardContent>
      </Card>
    );
  }
}

RecognizeCard.propTypes = {
  language: PropTypes.object,
  sentences: PropTypes.array,
  acceptedSentences: PropTypes.array,
  onSentenceAdd: PropTypes.func,
  onSentenceDelete: PropTypes.func,
};

export default withStyles(styles)(RecognizeCard);

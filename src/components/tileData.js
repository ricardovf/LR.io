import React from 'react';
import { ListItem, ListItemText } from 'material-ui/List';
import { Button } from 'material-ui';

export const languagesList = (
  <div>
    <ListItem button>
      <ListItemText primary="xxxxxyzz" />
    </ListItem>
    <ListItem button>
      <ListItemText primary="aaaaabbbbb" />
    </ListItem>

    <ListItem>
      <Button variant="raised" color="primary">
        Nova
      </Button>
    </ListItem>
  </div>
);

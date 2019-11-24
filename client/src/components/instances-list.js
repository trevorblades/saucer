import DeleteInstanceButton from './delete-instance-button';
import React from 'react';
import {LIST_INSTANCES} from '../utils';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography
} from '@material-ui/core';
import {useQuery} from '@apollo/client';

export default function InstancesList() {
  const {data, loading, error} = useQuery(LIST_INSTANCES);

  if (loading || error) {
    return (
      <Typography color={error ? 'error' : 'textSecondary'}>
        {error ? error.message : 'Loading...'}
      </Typography>
    );
  }

  if (!data.instances.length) {
    return <Typography>You have no instances</Typography>;
  }

  return (
    <List>
      {data.instances.map(instance => (
        <ListItem key={instance.id}>
          <ListItemText secondary={instance.status}>
            {instance.name}
          </ListItemText>
          <ListItemSecondaryAction>
            <DeleteInstanceButton instance={instance} />
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

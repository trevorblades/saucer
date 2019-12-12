import ActionMenu from '../action-menu';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import plant from '../../assets/plant.png';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Typography
} from '@material-ui/core';
import {LIST_INSTANCES} from '../../utils';
import {gql, useMutation} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id)
  }
`;

export default function InstanceActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteInstance, {loading, error}] = useMutation(DELETE_INSTANCE, {
    variables: {
      id: props.instance.id
    },
    update(cache, {data}) {
      const {instances} = cache.readQuery({
        query: LIST_INSTANCES
      });

      cache.writeQuery({
        query: LIST_INSTANCES,
        data: {
          instances: instances.filter(
            instance => instance.id !== data.deleteInstance
          )
        }
      });
    }
  });

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <ActionMenu>
        {closeMenu => [
          <MenuItem key="edit" disabled>
            Edit instance
          </MenuItem>,
          <MenuItem
            key="restart"
            disabled={props.instance.status !== 'stopped'}
          >
            Restart instance
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              closeMenu();
              setDialogOpen(true);
            }}
          >
            Delete instance
          </MenuItem>
        ]}
      </ActionMenu>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <DialogContent>
          <Box textAlign="center">
            <img src={plant} height={200} />
            <Typography gutterBottom variant="h5">
              Are you sure?
            </Typography>
          </Box>
          {error && (
            <Typography paragraph color="error">
              {error.message}
            </Typography>
          )}
          <Typography paragraph>
            Deleting is permanent! Once you delete{' '}
            <em>{props.instance.name}</em>, you won&apos;t be able to recover
            it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={loading} onClick={deleteInstance} color="primary">
            Yes, delete it
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

InstanceActions.propTypes = {
  instance: PropTypes.object.isRequired
};

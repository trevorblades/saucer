import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@material-ui/core';
import {LIST_INSTANCES} from '../utils';
import {gql, useMutation} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id) {
      id
    }
  }
`;

export default function DeleteInstanceButton(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteInstance, {loading}] = useMutation(DELETE_INSTANCE, {
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
            instance => instance.id !== data.deleteInstance.id
          )
        }
      });
    }
  });

  function handleClick() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <IconButton onClick={handleClick}>D</IconButton>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting is permanent! Once you delete{' '}
            <em>{props.instance.name}</em>, you won&apos;t be able to recover
            it.
          </DialogContentText>
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

DeleteInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

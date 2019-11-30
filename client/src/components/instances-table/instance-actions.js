import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@material-ui/core';
import {FiMoreHorizontal} from 'react-icons/fi';
import {LIST_INSTANCES} from '../../utils';
import {gql, useMutation} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id) {
      id
    }
  }
`;

export default function InstanceActions(props) {
  const [anchorEl, setAnchorEl] = useState(null);
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

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  function handleDeleteClick() {
    closeMenu();
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Tooltip title="More actions">
        <IconButton size="small" onClick={handleClick}>
          <FiMoreHorizontal size={24} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem>Edit instance</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete instance</MenuItem>
      </Menu>
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

InstanceActions.propTypes = {
  instance: PropTypes.object.isRequired
};

import ActionMenu from '../action-menu';
import DeleteConfirm from '../delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import plant from '../../assets/plant.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {LIST_INSTANCES} from '../../utils';
import {gql} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id)
  }
`;

export default function InstanceActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <MenuItem key="start" disabled={props.instance.status !== 'stopped'}>
            Start instance
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
        <DeleteConfirm
          image={plant}
          onCancel={closeDialog}
          mutation={DELETE_INSTANCE}
          mutationOptions={{
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
          }}
        >
          <Typography paragraph>
            Deleting is permanent! Once you delete{' '}
            <em>{props.instance.name}</em>, you won&apos;t be able to recover
            it.
          </Typography>
        </DeleteConfirm>
      </Dialog>
    </Fragment>
  );
}

InstanceActions.propTypes = {
  instance: PropTypes.object.isRequired
};

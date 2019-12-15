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
  const [dialogOpen, setDialogOpen] = useState(null);

  function closeDialog() {
    setDialogOpen(null);
  }

  return (
    <Fragment>
      <ActionMenu>
        {closeMenu => {
          function openDialog(event) {
            closeMenu();
            setDialogOpen(event.target.dataset.dialog);
          }

          return [
            <MenuItem key="edit" disabled>
              Edit instance
            </MenuItem>,
            <MenuItem
              key="start"
              data-dialog="start"
              disabled={props.instance.status !== 'stopped'}
              onClick={openDialog}
            >
              Start instance
            </MenuItem>,
            <MenuItem key="delete" data-dialog="delete" onClick={openDialog}>
              Delete instance
            </MenuItem>
          ];
        }}
      </ActionMenu>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={dialogOpen === 'delete'}
        onClose={closeDialog}
      >
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
      <Dialog
        fullWidth
        maxWidth="xs"
        open={dialogOpen === 'start'}
        onClose={closeDialog}
      >
        Hello
      </Dialog>
    </Fragment>
  );
}

InstanceActions.propTypes = {
  instance: PropTypes.object.isRequired
};

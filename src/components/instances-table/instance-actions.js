import ActionMenu from '../action-menu';
import DeleteConfirm from '../delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import burn from '../../assets/burn.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {LIST_INSTANCES} from '../../utils';
import {Link} from 'gatsby';
import {gql} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id) {
      id
    }
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
        {closeMenu => {
          const menuItems = [
            <MenuItem
              key="details"
              component={Link}
              to={`/dashboard/instances/${props.instance.id}`}
            >
              Instance details
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
          ];

          if (props.instance.status === 'Success') {
            menuItems.push(
              <MenuItem
                key="wordpress"
                component="a"
                href={`https://${props.instance.name}.saucer.dev/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Wordpress
              </MenuItem>
            );
          }

          return menuItems;
        }}
      </ActionMenu>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <DeleteConfirm
          image={burn}
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
                    instance => instance.id !== data.deleteInstance.id
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

import DeleteConfirm from './delete-confirm';
import PropTypes from 'prop-types';
import React from 'react';
import burn from '../assets/burn.png';
import {Dialog, Typography} from '@material-ui/core';
import {LIST_INSTANCES} from '../utils';
import {gql} from '@apollo/client';

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id) {
      id
    }
  }
`;

export default function DeleteInstanceDialog(props) {
  return (
    <Dialog fullWidth maxWidth="xs" open={props.open} onClose={props.onClose}>
      <DeleteConfirm
        image={burn}
        onCancel={props.onClose}
        mutation={DELETE_INSTANCE}
        mutationOptions={{
          variables: {
            id: props.instance.id
          },
          onCompleted: props.onCompleted,
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
          Deleting is permanent! Once you delete <em>{props.instance.name}</em>,
          you won&apos;t be able to recover it.
        </Typography>
      </DeleteConfirm>
    </Dialog>
  );
}

DeleteInstanceDialog.propTypes = {
  instance: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCompleted: PropTypes.func
};

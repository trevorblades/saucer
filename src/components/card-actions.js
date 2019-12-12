import ActionMenu from './action-menu';
import DeleteConfirm from './delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import grimReaper from '../assets/grim-reaper.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {gql} from '@apollo/client';

const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
  }
`;

export default function CardActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  // TODO: refetch instances query after delete

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <ActionMenu>
        {closeMenu => (
          <MenuItem
            onClick={() => {
              closeMenu();
              setDialogOpen(true);
            }}
          >
            Delete card
          </MenuItem>
        )}
      </ActionMenu>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <DeleteConfirm
          onCancel={closeDialog}
          image={grimReaper}
          mutation={DELETE_CARD}
          mutationOptions={{
            variables: {
              id: props.card.id
            }
          }}
        >
          <Typography paragraph>
            Are you sure you want to delete this payment method? Instances
            associated with this card will be <strong>stopped</strong> until a
            new payment method is set up for them:
          </Typography>
          <ul>
            <Typography component="li" gutterBottom>
              instance-name-2
            </Typography>
          </ul>
        </DeleteConfirm>
      </Dialog>
    </Fragment>
  );
}

CardActions.propTypes = {
  card: PropTypes.object.isRequired
};

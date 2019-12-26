import ActionMenu from './action-menu';
import DeleteConfirm from './delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import executioner from '../assets/executioner.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {LIST_CARDS, LIST_INSTANCES} from '../utils';
import {gql} from '@apollo/client';

const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      id
    }
  }
`;

export default function CardActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          image={executioner}
          mutation={DELETE_CARD}
          mutationOptions={{
            variables: {
              id: props.card.id
            },
            // also refetches new default card
            refetchQueries: [{query: LIST_INSTANCES}],
            update(cache, {data}) {
              const {cards} = cache.readQuery({query: LIST_CARDS});
              cache.writeQuery({
                query: LIST_CARDS,
                data: {
                  cards: cards.filter(card => card.id !== data.deleteCard.id)
                }
              });
            }
          }}
        >
          <Typography paragraph>
            Are you sure you want to delete this payment method?
          </Typography>
          {/* TODO: "this card is associated with x active instances. you must delete the instances or set up a new default payment method to delete this card." */}
        </DeleteConfirm>
      </Dialog>
    </Fragment>
  );
}

CardActions.propTypes = {
  card: PropTypes.object.isRequired
};

import ActionMenu from './action-menu';
import DeleteConfirm from './delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import executioner from '../assets/executioner.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {LIST_CARDS, LIST_INSTANCES, sortByDefault} from '../utils';
import {gql, useMutation} from '@apollo/client';

const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      id
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!) {
    updateCard(id: $id) {
      id
      isDefault
    }
  }
`;

export default function CardActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateCard, {loading}] = useMutation(UPDATE_CARD, {
    refetchQueries: [{query: LIST_INSTANCES}],
    variables: {
      id: props.card.id
    },
    update(cache, {data}) {
      const {cards} = cache.readQuery({query: LIST_CARDS});
      cache.writeQuery({
        query: LIST_CARDS,
        data: {
          cards: cards
            .map(card =>
              card.id === data.updateCard.id
                ? data.updateCard
                : {
                    ...card,
                    isDefault: false
                  }
            )
            .sort(sortByDefault)
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
        {closeMenu => (
          <div>
            {props.card.isDefault ? null : (
              <MenuItem
                disabled={loading}
                onClick={() => {
                  closeMenu();
                  updateCard();
                }}
              >
                Make default
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                closeMenu();
                setDialogOpen(true);
              }}
            >
              Delete card
            </MenuItem>
          </div>
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

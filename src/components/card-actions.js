import ActionMenu from './action-menu';
import DeleteConfirm from './delete-confirm';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import grimReaper from '../assets/grim-reaper.png';
import {Dialog, MenuItem, Typography} from '@material-ui/core';
import {LIST_CARDS, LIST_INSTANCES} from '../utils';
import {gql} from '@apollo/client';

const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
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
          image={grimReaper}
          mutation={DELETE_CARD}
          mutationOptions={{
            variables: {
              id: props.card.id
            },
            // also refetches cards (for new default)
            refetchQueries: [{query: LIST_INSTANCES}],
            update(cache, {data}) {
              const {cards} = cache.readQuery({query: LIST_CARDS});
              cache.writeQuery({
                query: LIST_CARDS,
                data: {
                  cards: cards.filter(card => card.id !== data.deleteCard)
                }
              });
            }
          }}
        >
          <Typography paragraph>
            Are you sure you want to delete this payment method?
          </Typography>
          {props.card.instances.length > 0 && (
            <Fragment>
              <Typography paragraph>
                Instances associated with this card will be{' '}
                <strong>stopped</strong> until a new payment method is set up
                for them:
              </Typography>
              <ul>
                {props.card.instances.map(instance => (
                  <Typography key={instance.id} component="li" gutterBottom>
                    {instance.name}
                  </Typography>
                ))}
              </ul>
            </Fragment>
          )}
        </DeleteConfirm>
      </Dialog>
    </Fragment>
  );
}

CardActions.propTypes = {
  card: PropTypes.object.isRequired
};

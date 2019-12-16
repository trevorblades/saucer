import CardsSelect from '../cards-select';
import DialogHeader from '../dialog-header';
import PropTypes from 'prop-types';
import React from 'react';
import dive from '../../assets/dive.png';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText
} from '@material-ui/core';
import {INSTANCE_FRAGMENT} from '../../utils';
import {gql, useMutation} from '@apollo/client';

const START_INSTANCE = gql`
  mutation StartInstance($id: ID!, $source: String!) {
    startInstance(id: $id, source: $source) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function RestartForm(props) {
  const [startInstance, {loading, error}] = useMutation(
    START_INSTANCE,
    props.mutationOptions
  );

  function handleSubmit(event) {
    event.preventDefault();
    startInstance({
      variables: {
        source: event.target.source.value || null
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <DialogHeader image={dive}>Restart your instance</DialogHeader>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
        <DialogContentText>
          Please connect a payment method to this instance to continue using it.
        </DialogContentText>
        <CardsSelect cards={props.cards} disabled={loading} name="source" />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button disabled={loading} type="submit" color="primary">
          Restart instance
        </Button>
      </DialogActions>
    </form>
  );
}

RestartForm.propTypes = {
  mutationOptions: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  onCancel: PropTypes.func.isRequired
};

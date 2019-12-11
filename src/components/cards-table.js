import EmptyState from './empty-state';
import PropTypes from 'prop-types';
import React from 'react';
import dog from '../assets/dog.png';
import {Typography} from '@material-ui/core';
import {gql, useQuery} from '@apollo/client';

const LIST_CARDS = gql`
  {
    cards {
      id
    }
  }
`;

export default function CardsTable(props) {
  const {data, loading, error} = useQuery(LIST_CARDS);

  if (loading || error) {
    return (
      <Typography color={error ? 'error' : 'textSecondary'} variant="h6">
        {error ? error.message : 'Loading...'}
      </Typography>
    );
  }

  if (!data.cards.length) {
    return (
      <EmptyState
        image={dog}
        title="You have no payment methods"
        subtitle="Configure a credit card here"
        buttonText="Add card"
        onButtonClick={props.onAddCard}
      />
    );
  }

  return (
    <div>
      {data.cards.map(card => (
        <div key={card.id} />
      ))}
    </div>
  );
}

CardsTable.propTypes = {
  onAddCard: PropTypes.func.isRequired
};

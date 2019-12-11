import EmptyState from './empty-state';
import React from 'react';
import dog from '../assets/dog.png';
import {Typography} from '@material-ui/core';
import {gql, useQuery} from '@apollo/client';

const LIST_PAYMENT_METHODS = gql`
  {
    paymentMethods {
      id
    }
  }
`;

export default function PaymentMethodsTable() {
  const {data, loading, error} = useQuery(LIST_PAYMENT_METHODS);

  if (loading || error) {
    return (
      <Typography color={error ? 'error' : 'textSecondary'} variant="h6">
        {error ? error.message : 'Loading...'}
      </Typography>
    );
  }

  if (!data.paymentMethods.length) {
    return (
      <EmptyState
        image={dog}
        title="You have no payment methods"
        subtitle="Configure a credit card here"
        buttonText="Add a card"
        onButtonClick={() => {}}
      />
    );
  }

  return (
    <div>
      {data.paymentMethods.map(paymentMethod => (
        <div key={paymentMethod.id} />
      ))}
    </div>
  );
}

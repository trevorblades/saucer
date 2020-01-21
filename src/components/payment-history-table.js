import PaymentMethod from './payment-method';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import {gql, useQuery} from '@apollo/client';

const LIST_PAYMENTS = gql`
  {
    payments {
      id
      amount
      created
      card {
        brand
        last4
      }
    }
  }
`;

export default function PaymentHistoryTable() {
  const {data, loading, error} = useQuery(LIST_PAYMENTS);

  if (loading || error || !data.payments.length) {
    return (
      <Typography
        color={error ? 'error' : loading ? 'textSecondary' : 'textPrimary'}
        variant="h6"
      >
        {error ? error.message : loading ? 'Loading...' : 'No payments to show'}
      </Typography>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="none">Card</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.payments.map(payment => {
          const created = new Date(payment.created);
          return (
            <TableRow key={payment.id}>
              <TableCell padding="none">
                <PaymentMethod card={payment.card} />
              </TableCell>
              <TableCell>{created.toLocaleString()}</TableCell>
              <TableCell>${(payment.amount / 100).toFixed(2)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

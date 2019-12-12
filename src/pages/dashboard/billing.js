import CardForm from '../../components/card-form';
import PaymentMethod from '../../components/payment-method';
import QueryTable from '../../components/query-table';
import React, {Fragment, useState} from 'react';
import StripeElementsProvider from '../../components/stripe-elements-provider';
import dog from '../../assets/dog.png';
import {
  Chip,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {gql} from '@apollo/client';

const LIST_CARDS = gql`
  {
    cards {
      id
      brand
      last4
      expMonth
      expYear
      isDefault
    }
  }
`;

export default function Billing() {
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <QueryTable
        title="Billing settings"
        query={LIST_CARDS}
        dataKey="cards"
        EmptyStateProps={{
          image: dog,
          title: 'You have no payment methods',
          subtitle: 'Configure a credit card here',
          buttonText: 'Add card',
          onButtonClick: openDialog
        }}
        renderTable={cards => (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none">Card number</TableCell>
                <TableCell>Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map(card => (
                <TableRow key={card.id}>
                  <TableCell padding="none">
                    <PaymentMethod
                      card={card}
                      defaultIndicator={<Chip size="small" label="Default" />}
                    />
                  </TableCell>
                  <TableCell>
                    {card.expMonth.toString().padStart(2, '0')}/
                    {card.expYear.toString().slice(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      />
      <Dialog fullWidth open={dialogOpen} onClose={closeDialog}>
        <StripeElementsProvider>
          <CardForm onCancel={closeDialog} />
        </StripeElementsProvider>
      </Dialog>
    </Fragment>
  );
}

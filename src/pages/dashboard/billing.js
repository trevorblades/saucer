import CardActions from '../../components/card-actions';
import CardForm from '../../components/card-form';
import PaymentMethod from '../../components/payment-method';
import QueryTable from '../../components/query-table';
import React, {Fragment, useState} from 'react';
import StripeElementsProvider from '../../components/stripe-elements-provider';
import SuccessToast from '../../components/success-toast';
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
import {LIST_CARDS} from '../../utils';

export default function Billing() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  function closeSnackbar() {
    setSnackbarOpen(false);
  }

  function handleCompleted() {
    closeDialog();
    setSnackbarOpen(true);
  }

  return (
    <Fragment>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <QueryTable
        title="Payment methods"
        query={LIST_CARDS}
        dataKey="cards"
        emptyState={{
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
                <TableCell colSpan={2}>Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map(card => (
                <TableRow key={card.id}>
                  <TableCell padding="none">
                    <PaymentMethod card={card}>
                      {card.isDefault && <Chip size="small" label="Default" />}
                    </PaymentMethod>
                  </TableCell>
                  <TableCell>
                    {card.expMonth.toString().padStart(2, '0')}/
                    {card.expYear.toString().slice(2)}
                  </TableCell>
                  <TableCell align="right" padding="checkbox">
                    <CardActions card={card} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      >
        {data => (
          <Dialog
            fullWidth
            maxWidth="xs"
            open={dialogOpen}
            onClose={closeDialog}
          >
            <StripeElementsProvider>
              <CardForm
                isDefault={!data.cards.length}
                onCancel={closeDialog}
                onCompleted={handleCompleted}
              />
            </StripeElementsProvider>
          </Dialog>
        )}
      </QueryTable>
      <SuccessToast
        open={snackbarOpen}
        onClose={closeSnackbar}
        message="Card added 🎉"
      />
    </Fragment>
  );
}

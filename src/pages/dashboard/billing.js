import CardActions from '../../components/card-actions';
import CardForm from '../../components/card-form';
import PaymentMethod from '../../components/payment-method';
import QueryTable from '../../components/query-table';
import React, {Fragment, useState} from 'react';
import StripeElementsProvider from '../../components/stripe-elements-provider';
import dog from '../../assets/dog.png';
import {
  Chip,
  Dialog,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import {FiX} from 'react-icons/fi';
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

  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    closeSnackbar();
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
        EmptyStateProps={{
          image: dog,
          title: 'You have no payment methods',
          subtitle: 'Configure a credit card here',
          buttonText: 'Add card',
          onButtonClick: openDialog
        }}
        renderTable={data => (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none">Card number</TableCell>
                <TableCell colSpan={2}>Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.cards.map(card => (
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
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        autoHideDuration={3000}
        action={
          <IconButton onClick={closeSnackbar} size="small" color="inherit">
            <FiX size={20} />
          </IconButton>
        }
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message="Card added 🎉"
      />
    </Fragment>
  );
}

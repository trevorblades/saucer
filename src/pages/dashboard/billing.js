import CardForm from '../../components/card-form';
import CardsTable from '../../components/cards-table';
import React, {Fragment, useState} from 'react';
import StripeElementsProvider from '../../components/stripe-elements-provider';
import {Dialog, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';

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
      <Typography gutterBottom variant="h4">
        Billing settings
      </Typography>
      <CardsTable onAddCard={openDialog} />
      <Dialog fullWidth open={dialogOpen} onClose={closeDialog}>
        <StripeElementsProvider>
          <CardForm onCancel={closeDialog} />
        </StripeElementsProvider>
      </Dialog>
    </Fragment>
  );
}

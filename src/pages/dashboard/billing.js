import PaymentMethodsTable from '../../components/payment-methods-table';
import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Typography} from '@material-ui/core';

export default function Billing() {
  return (
    <Fragment>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <Typography gutterBottom variant="h4">
        Billing settings
      </Typography>
      <PaymentMethodsTable />
    </Fragment>
  );
}

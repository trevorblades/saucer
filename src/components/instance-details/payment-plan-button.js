import PaymentPlanForm from './payment-plan-form';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {Button, Dialog} from '@material-ui/core';

export default function PaymentPlanButton({defaultCard, ...props}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Button {...props} onClick={openDialog}>
        Add payment plan
      </Button>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <PaymentPlanForm defaultCard={defaultCard} />
      </Dialog>
    </Fragment>
  );
}

PaymentPlanButton.propTypes = {
  defaultCard: PropTypes.object
};

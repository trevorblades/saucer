import DialogHeader from '../dialog-header';
import PaymentMethod from '../payment-method';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import unlock from '../../assets/unlock.png';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography
} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';

export default function AddPaymentPlanButton({defaultCard, ...props}) {
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
        <DialogHeader image={unlock}>Add a payment plan</DialogHeader>
        <DialogContent>
          {defaultCard ? (
            <PaymentMethod card={defaultCard} />
          ) : (
            <Typography>
              You have no payment methods configured. Please{' '}
              <Link to="/dashboard/billing">add a card</Link> in your billing
              settings.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button disabled={!defaultCard} type="submit" color="primary">
            Add plan
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

AddPaymentPlanButton.propTypes = {
  defaultCard: PropTypes.object
};

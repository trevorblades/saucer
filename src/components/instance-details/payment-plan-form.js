import DialogHeader from '../dialog-header';
import PaymentMethod from '../payment-method';
import PlanButtons from '../plan-buttons';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import unlock from '../../assets/unlock.png';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography
} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';
import {useMutation} from '@apollo/client';

export default function PaymentPlanForm(props) {
  const [updateInstance, {loading, error}] = useMutation();

  function handleSubmit(event) {
    event.preventDefault();

    console.log();
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader image={unlock}>Add a payment plan</DialogHeader>
      <DialogContent>
        {props.defaultCard ? (
          <Fragment>
            {error && (
              <DialogContentText color="error">
                {error.message}
              </DialogContentText>
            )}
            <Box mb={2}>
              <PlanButtons />
            </Box>
            <Typography gutterBottom variant="subtitle2">
              Payment method
            </Typography>
            <Typography>
              <PaymentMethod card={props.defaultCard} />
            </Typography>
          </Fragment>
        ) : (
          <Typography>
            You have no payment methods configured. Please{' '}
            <Link to="/dashboard/billing">add a card</Link> in your billing
            settings.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button
          disabled={!props.defaultCard || loading}
          type="submit"
          color="primary"
        >
          Add plan
        </Button>
      </DialogActions>
    </form>
  );
}

PaymentPlanForm.propTypes = {
  defaultCard: PropTypes.object,
  onCancel: PropTypes.func.isRequired
};

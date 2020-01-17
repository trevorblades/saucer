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
  Typography
} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';

export default function PaymentPlanForm(props) {
  return (
    <Fragment>
      <DialogHeader image={unlock}>Add a payment plan</DialogHeader>
      <DialogContent>
        {props.defaultCard ? (
          <Fragment>
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
        <Button disabled={!props.defaultCard} type="submit" color="primary">
          Add plan
        </Button>
      </DialogActions>
    </Fragment>
  );
}

PaymentPlanForm.propTypes = {
  defaultCard: PropTypes.object,
  onCancel: PropTypes.func.isRequired
};

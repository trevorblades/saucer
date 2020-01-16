import AddPaymentPlanButton from './add-payment-plan-button';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Typography} from '@material-ui/core';

export default function TrialDetails(props) {
  return (
    <Fragment>
      <Typography gutterBottom>
        Free trial &bull; Expires {props.expiryDate.toLocaleString()}
      </Typography>
      <AddPaymentPlanButton variant="contained" color="primary" />
    </Fragment>
  );
}

TrialDetails.propTypes = {
  expiryDate: PropTypes.instanceOf(Date).isRequired
};

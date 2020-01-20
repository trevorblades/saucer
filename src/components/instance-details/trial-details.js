import PaymentPlanButton from './payment-plan-button';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Typography} from '@material-ui/core';

export default function TrialDetails(props) {
  return (
    <Fragment>
      <Typography gutterBottom>
        Free trial &bull; Expires {props.expiryDate.toLocaleString()}
      </Typography>
      <PaymentPlanButton
        instance={props.instance}
        defaultCard={props.defaultCard}
        onCompleted={props.onPaymentPlanCompleted}
      />
    </Fragment>
  );
}

TrialDetails.propTypes = {
  expiryDate: PropTypes.instanceOf(Date).isRequired,
  defaultCard: PropTypes.object,
  instance: PropTypes.object.isRequired,
  onPaymentPlanCompleted: PropTypes.func.isRequired
};

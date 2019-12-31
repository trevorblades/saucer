import PaymentMethod from '../payment-method';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Typography} from '@material-ui/core';

export default function SubscriptionDetails(props) {
  const {amount, interval} = props.subscription.plan;
  return (
    <Fragment>
      <Typography gutterBottom>
        Plan: ${amount / 100} per {interval}
      </Typography>
      <Typography>
        <PaymentMethod card={props.defaultCard} />
      </Typography>
    </Fragment>
  );
}

SubscriptionDetails.propTypes = {
  subscription: PropTypes.object.isRequired,
  defaultCard: PropTypes.object.isRequired
};

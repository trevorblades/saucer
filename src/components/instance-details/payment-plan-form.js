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
import {INSTANCE_DETAILS_FRAGMENT} from '../../utils';
import {Link} from 'gatsby-theme-material-ui';
import {gql, useMutation} from '@apollo/client';

const UPDATE_INSTANCE = gql`
  mutation UpdateInstance($id: ID!, $plan: String!) {
    updateInstance(id: $id, plan: $plan) {
      ...InstanceDetailsFragment
    }
  }
  ${INSTANCE_DETAILS_FRAGMENT}
`;

export default function PaymentPlanForm(props) {
  const [updateInstance, {loading, error}] = useMutation(UPDATE_INSTANCE, {
    onCompleted: props.onCompleted,
    variables: {
      id: props.instance.id
    }
  });

  function handleSubmit(event) {
    event.preventDefault();

    updateInstance({
      variables: {
        plan: event.target.plan.value
      }
    });
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
  instance: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompleted: PropTypes.func
};

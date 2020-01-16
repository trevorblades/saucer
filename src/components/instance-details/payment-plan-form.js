import DialogHeader from '../dialog-header';
import PaymentMethod from '../payment-method';
import PlanButton, {PlanButtonContext} from '../plan-button';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import unlock from '../../assets/unlock.png';
import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Typography
} from '@material-ui/core';
import {LIST_STRIPE_PLANS} from '../../utils';
import {Link} from 'gatsby-theme-material-ui';
import {useStaticQuery} from 'gatsby';

export default function PaymentPlanForm(props) {
  const {allStripePlan} = useStaticQuery(LIST_STRIPE_PLANS);
  const [plan, setPlan] = useState(allStripePlan.nodes[0]);

  return (
    <Fragment>
      <DialogHeader image={unlock}>Add a payment plan</DialogHeader>
      <DialogContent>
        {props.defaultCard ? (
          <Fragment>
            <PlanButtonContext.Provider value={{plan, setPlan}}>
              <Grid container spacing={2}>
                {allStripePlan.nodes.map(plan => (
                  <Grid item xs={6} key={plan.id}>
                    <PlanButton
                      value={plan.id}
                      cost={`$${plan.amount / 100}`}
                      label={`per ${plan.interval}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </PlanButtonContext.Provider>
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

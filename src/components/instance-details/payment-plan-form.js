import DialogHeader from '../dialog-header';
import PaymentMethod from '../payment-method';
import PlanButton, {PlanButtonContext} from '../plan-button';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import unlock from '../../assets/unlock.png';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Typography
} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';
import {graphql, useStaticQuery} from 'gatsby';

export default function PaymentPlanForm(props) {
  const {allStripePlan} = useStaticQuery(
    graphql`
      {
        allStripePlan(sort: {fields: amount}) {
          nodes {
            interval
            amount
            id
          }
        }
      }
    `
  );

  const [plan, setPlan] = useState(allStripePlan.nodes[0].id);
  return (
    <Fragment>
      <DialogHeader image={unlock}>Add a payment plan</DialogHeader>
      <DialogContent>
        {props.defaultCard ? (
          <Fragment>
            <Box mb={2}>
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

import FormButton from './form-button';
import PropTypes from 'prop-types';
import React, {createContext, useContext, useState} from 'react';
import {Grid, Typography} from '@material-ui/core';
import {graphql, useStaticQuery} from 'gatsby';

const PlanButtonContext = createContext();

export function PlanButton({cost, label, value, ...props}) {
  const {plan, setPlan} = useContext(PlanButtonContext);

  function handleClick() {
    setPlan(value);
  }

  return (
    <FormButton {...props} onClick={handleClick} selected={plan === value}>
      <Typography variant="h6">{cost}</Typography>
      <Typography variant="body2">{label}</Typography>
    </FormButton>
  );
}

PlanButton.propTypes = {
  cost: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string
};

const LIST_STRIPE_PLANS = graphql`
  {
    allStripePlan(sort: {fields: amount}) {
      nodes {
        interval
        amount
        id
      }
    }
  }
`;

export default function PlanButtons(props) {
  const {allStripePlan} = useStaticQuery(LIST_STRIPE_PLANS);
  const [plan, setPlan] = useState(
    typeof props.defaultValue === 'undefined'
      ? allStripePlan.nodes[0].id
      : props.defaultValue
  );

  return (
    <PlanButtonContext.Provider value={{plan, setPlan}}>
      <Grid container spacing={2}>
        {props.children && (
          <Grid item xs={4}>
            {props.children}
          </Grid>
        )}
        {allStripePlan.nodes.map(plan => (
          <Grid item xs={props.children ? 4 : 6} key={plan.id}>
            <PlanButton
              value={plan.id}
              cost={`$${plan.amount / 100}`}
              label={`per ${plan.interval}`}
            />
          </Grid>
        ))}
      </Grid>
      <input readOnly type="hidden" value={plan} name="plan" />
    </PlanButtonContext.Provider>
  );
}

PlanButtons.propTypes = {
  children: PropTypes.element,
  defaultValue: PropTypes.string
};

import FormButton from './form-button';
import PropTypes from 'prop-types';
import React, {createContext, useContext} from 'react';
import {Typography} from '@material-ui/core';

export const PlanButtonContext = createContext();

export default function PlanButton({cost, label, value, ...props}) {
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

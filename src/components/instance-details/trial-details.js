import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Button, Typography} from '@material-ui/core';

export default function TrialDetails(props) {
  return (
    <Fragment>
      <Typography gutterBottom>
        Free trial &bull;{' '}
        {Date.now() > props.expiryDate
          ? 'Expired'
          : `Expires ${props.expiryDate.toLocaleString()}`}
      </Typography>
      <Button variant="contained" color="primary">
        Add payment plan
      </Button>
    </Fragment>
  );
}

TrialDetails.propTypes = {
  expiryDate: PropTypes.instanceOf(Date).isRequired
};

import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Tooltip, Typography} from '@material-ui/core';
import {formatDistanceToNow} from 'date-fns';

export default function TrialDetails(props) {
  return (
    <Fragment>
      <Typography>Free trial</Typography>
      <Typography>
        {Date.now() > props.expiryDate ? (
          'Expired'
        ) : (
          <Fragment>
            Expires{' '}
            <Tooltip title={props.expiryDate.toLocaleString()}>
              <span>
                {formatDistanceToNow(props.expiryDate, {
                  addSuffix: true
                })}
              </span>
            </Tooltip>
          </Fragment>
        )}
      </Typography>
    </Fragment>
  );
}

TrialDetails.propTypes = {
  expiryDate: PropTypes.instanceOf(Date).isRequired
};

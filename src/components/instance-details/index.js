import ActiveInstance from './active-instance';
import EmptyState from '../empty-state';
import PropTypes from 'prop-types';
import React from 'react';
import bird from '../../assets/bird.png';
import error from '../../assets/error.png';
import waiting from '../../assets/waiting.png';
import {Box, Button, LinearProgress, Typography} from '@material-ui/core';

export default function InstanceDetails(props) {
  switch (props.instance.status) {
    case 'Pending':
    case 'Delayed':
    case 'InProgress':
      return (
        <EmptyState image={waiting}>
          <Box mb={3}>
            <Box width={1 / 2} mx="auto" mb={2}>
              <LinearProgress />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Preparing your Wordpress instance...
            </Typography>
          </Box>
        </EmptyState>
      );
    case 'TimedOut':
    case 'Failed':
      return (
        <EmptyState image={error}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography paragraph>
            Delete your instance and create a new one
          </Typography>
        </EmptyState>
      );
    case 'Success':
      if (
        !props.instance.subscription &&
        true
        // Date.now() > new Date(props.instance.expiresAt)
      ) {
        return (
          <EmptyState image={bird}>
            <Box mb={3}>
              <Typography variant="h5" gutterBottom>
                Your free trial is expired
              </Typography>
              <Typography>
                Add a payment plan to regain access to your instance
              </Typography>
            </Box>
            <Button size="large" color="primary" variant="contained">
              Add payment plan
            </Button>
          </EmptyState>
        );
      }

      return (
        <ActiveInstance
          instance={props.instance}
          defaultCard={props.defaultCard}
        />
      );
    default:
      return null;
  }
}

InstanceDetails.propTypes = {
  instance: PropTypes.object.isRequired,
  defaultCard: PropTypes.object
};

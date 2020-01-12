import DeleteInstanceButton from './delete-instance-button';
import EmptyState, {EmptyStateWrapper} from '../empty-state';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import SubscriptionDetails from './subscription-details';
import error from '../../assets/error.png';
import waiting from '../../assets/waiting.png';
import {Box, LinearProgress, Link, Typography} from '@material-ui/core';
import {FiArrowUpRight} from 'react-icons/fi';

function ListItem(props) {
  return <Typography gutterBottom component="li" {...props} />;
}

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
      return (
        <Fragment>
          <EmptyStateWrapper p={2}>
            <Typography variant="subtitle1">
              Wordpress is running at{' '}
              <Link
                href={`https://${props.instance.name}.saucer.dev/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${props.instance.name}.saucer.dev`}
                <Box
                  component={FiArrowUpRight}
                  ml={0.5}
                  size="1em"
                  style={{verticalAlign: -1}}
                />
              </Link>
            </Typography>
          </EmptyStateWrapper>
          <Box mb={3}>
            <Typography gutterBottom variant="h5">
              Next steps
            </Typography>
            <ul>
              <ListItem>Create a static Wordpress site with Gatsby</ListItem>
              <ListItem>
                Trigger Netlify deploys on every content publish
              </ListItem>
              <ListItem>Send data to Wordpress using GraphQL</ListItem>
              <ListItem>Configure a custom domain</ListItem>
            </ul>
          </Box>
          <Box mb={3}>
            <Typography gutterBottom variant="h5">
              Billing settings
            </Typography>
            {props.instance.subscription ? (
              <SubscriptionDetails
                subscription={props.instance.subscription}
                defaultCard={props.defaultCard}
              />
            ) : (
              <Typography>Free instance 🥳</Typography>
            )}
          </Box>
          <Typography gutterBottom variant="h5">
            Danger zone
          </Typography>
          <DeleteInstanceButton instance={props.instance} />
        </Fragment>
      );
    default:
      return null;
  }
}

InstanceDetails.propTypes = {
  instance: PropTypes.object.isRequired,
  defaultCard: PropTypes.object
};

import 'graphiql/graphiql.css';
import DeleteInstanceButton from './delete-instance-button';
import EmptyState, {EmptyStateWrapper} from '../empty-state';
import GraphiQL from 'graphiql';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import SubscriptionDetails from './subscription-details';
import TrialDetails from './trial-details';
import error from '../../assets/error.png';
import waiting from '../../assets/waiting.png';
import {Box, LinearProgress, Link, Typography} from '@material-ui/core';
import {FiArrowUpRight} from 'react-icons/fi';

const defaultQuery = `{
  posts {
    nodes {
      id
      slug
      title
    }
  }
}`;

export default function InstanceDetails(props) {
  const instanceDomain = props.instance.name + '.saucer.dev';
  const instanceUrl = 'https://' + instanceDomain;
  const graphqlUrl = instanceUrl + '/graphql';

  async function graphQLFetcher(graphQLParams) {
    const response = await fetch(graphqlUrl, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(graphQLParams)
    });
    return response.json();
  }

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
                href={instanceUrl + '/wp-admin'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {instanceDomain}
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
              GraphQL API
            </Typography>
            <Typography paragraph>{graphqlUrl}</Typography>
            <Box height={600} style={{boxSizing: 'content-box'}}>
              <GraphiQL fetcher={graphQLFetcher} defaultQuery={defaultQuery} />
            </Box>
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
              <TrialDetails expiryDate={new Date(props.instance.expiresAt)} />
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

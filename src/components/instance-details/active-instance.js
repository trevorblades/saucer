import CopyUrl from './copy-url';
import DeleteInstanceButton from './delete-instance-button';
import GraphiQL from 'graphiql';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import SubscriptionDetails from './subscription-details';
import TrialDetails from './trial-details';
import {Box, Link, Typography} from '@material-ui/core';
import {EmptyStateWrapper} from '../empty-state';
import {FiArrowUpRight} from 'react-icons/fi';
import {outdent} from 'outdent';

const defaultQuery = outdent`
  {
    generalSettings {
      title
      description
    }
    posts {
      nodes {
        id
        slug
        title
      }
    }
  }
`;

export default function ActiveInstance(props) {
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
        <CopyUrl url={graphqlUrl} />
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
          <TrialDetails
            instance={props.instance}
            defaultCard={props.defaultCard}
            expiryDate={new Date(props.instance.expiresAt)}
          />
        )}
      </Box>
      <Box mb={1}>
        <Typography gutterBottom variant="h5">
          Danger zone
        </Typography>
        <DeleteInstanceButton instance={props.instance} />
      </Box>
    </Fragment>
  );
}

ActiveInstance.propTypes = {
  instance: PropTypes.object.isRequired,
  defaultCard: PropTypes.object
};

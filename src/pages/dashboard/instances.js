import InstanceDetails from '../../components/instance-details';
import InstanceIcon from '../../components/instance-icon';
import PropTypes from 'prop-types';
import React, {Fragment, useEffect} from 'react';
import {Box, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {INSTANCE_FRAGMENT} from '../../utils';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    instance(id: $id) {
      ...InstanceFragment
      expiresAt
      subscription {
        plan {
          amount
          interval
        }
      }
    }
    defaultCard {
      last4
      brand
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function Instances(props) {
  const {data, loading, error, stopPolling} = useQuery(GET_INSTANCE, {
    pollInterval: 5000,
    variables: {
      id: props['*']
    }
  });

  useEffect(() => {
    if (data && data.instance) {
      const {status} = data.instance;
      if (
        status !== 'Pending' &&
        status !== 'Delayed' &&
        status !== 'InProgress'
      ) {
        stopPolling();
      }
    }
  }, [data, stopPolling]);

  if (loading) {
    return <Typography variant="h4">Loading...</Typography>;
  }

  if (error) {
    return (
      <Fragment>
        <Typography paragraph variant="h4">
          Something went wrong
        </Typography>
        <Typography color="error" variant="h6">
          {error.message}
        </Typography>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>{data.instance.name}</title>
      </Helmet>
      <Box display="flex" alignItems="center" mb={2}>
        <InstanceIcon name={data.instance.name} fontSize={24} mr={2} />
        <Typography variant="h4">{data.instance.name}</Typography>
      </Box>
      <InstanceDetails
        instance={data.instance}
        defaultCard={data.defaultCard}
      />
    </Fragment>
  );
}

Instances.propTypes = {
  '*': PropTypes.string.isRequired
};

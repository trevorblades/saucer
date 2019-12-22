import InstanceContent from '../../components/instance-content';
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
      <Box color="error.main">
        <Typography paragraph variant="h4">
          Error
        </Typography>
        <Typography variant="h6">{error.message}</Typography>
      </Box>
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>{data.instance.name}</title>
      </Helmet>
      <Box mb={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <InstanceIcon name={data.instance.name} fontSize={24} mr={2} />
          <Typography variant="h4">{data.instance.name}</Typography>
        </Box>
        <InstanceContent instance={data.instance} />
      </Box>
    </Fragment>
  );
}

Instances.propTypes = {
  '*': PropTypes.string.isRequired
};

import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    # only need id and status for the cache to update automatically
    instance(id: $id) {
      id
      status
      isReady
    }
  }
`;

function PollInstance(props) {
  useQuery(GET_INSTANCE, props.queryOptions);
  return props.children;
}

function StatusMessage(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box
        width={12}
        height={12}
        mr={1}
        borderRadius="50%"
        bgcolor={props.color}
      />
      {props.children}
    </Box>
  );
}

StatusMessage.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default function InstanceStatus(props) {
  const {id, status, isReady} = props.instance;
  const queryOptions = {
    variables: {id},
    pollInterval: 5000
  };

  switch (status) {
    case 'running':
    case 'pending': {
      const isRunning = status === 'running';
      const isActive = isRunning && isReady;
      return (
        <StatusMessage color={isActive ? 'limegreen' : 'gold'}>
          {isRunning && isActive ? (
            'Active'
          ) : (
            <PollInstance queryOptions={queryOptions}>
              {isRunning ? 'Installing' : 'Starting'}
            </PollInstance>
          )}
        </StatusMessage>
      );
    }
    case 'stopping':
    case 'stopped':
      return (
        <StatusMessage color="error.main">
          {status === 'stopping' ? (
            <PollInstance queryOptions={queryOptions}>Stopping</PollInstance>
          ) : (
            'Stopped'
          )}
        </StatusMessage>
      );
    default:
      return <StatusMessage color="lightgrey">Unknown</StatusMessage>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

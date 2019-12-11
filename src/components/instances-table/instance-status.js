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

function PollInstance(props) {
  // poll for status updates when the instance is starting
  useQuery(GET_INSTANCE, {
    variables: props.variables,
    pollInterval: 5000
  });

  return props.children;
}

export default function InstanceStatus(props) {
  const {status, isReady} = props.instance;
  switch (status) {
    case 'running':
    case 'pending': {
      const isRunning = status === 'running';
      if (isRunning && isReady) {
        return <StatusMessage color="limegreen">Active</StatusMessage>;
      }
      return (
        <PollInstance variables={{id: props.instance.id}}>
          <StatusMessage color="gold">
            {isRunning ? 'Installing' : 'Starting'}
          </StatusMessage>
        </PollInstance>
      );
    }
    case 'stopping':
    case 'stopped':
      return (
        <StatusMessage color="error.main">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </StatusMessage>
      );
    default:
      return <StatusMessage color="grey">Unknown</StatusMessage>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

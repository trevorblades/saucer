import PropTypes from 'prop-types';
import React from 'react';
import StatusMessage from './status-message';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    # only need id and status for the cache to update automatically
    instance(id: $id) {
      id
      status
    }
  }
`;

function PollInstance(props) {
  // poll for status updates when the instance is starting
  useQuery(GET_INSTANCE, {
    variables: props.variables,
    pollInterval: 5000
  });

  return props.children;
}

export default function InstanceStatus(props) {
  const {status} = props.instance;
  switch (status) {
    case 'running':
      return <StatusMessage color="limegreen">Active</StatusMessage>;
    case 'pending':
      return (
        <PollInstance variables={{id: props.instance.id}}>
          <StatusMessage color="gold">Starting</StatusMessage>
        </PollInstance>
      );
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

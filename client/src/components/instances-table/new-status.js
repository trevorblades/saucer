import PropTypes from 'prop-types';
import React from 'react';
import StatusMessage from './status-message';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    instance(id: $id) {
      id
      status
    }
  }
`;

export default function NewStatus(props) {
  // poll for status updates when the status is 'new'
  useQuery(GET_INSTANCE, {
    variables: props.variables,
    pollInterval: 5000
  });

  return <StatusMessage color="gold">Starting up...</StatusMessage>;
}

NewStatus.propTypes = {
  variables: PropTypes.object.isRequired
};

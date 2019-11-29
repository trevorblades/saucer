import PropTypes from 'prop-types';
import ProvisionInstanceButton from './provision-instance-button';
import React from 'react';
import {Box} from '@material-ui/core';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    instance(id: $id) {
      id
      status
    }
  }
`;

function NewStatus(props) {
  // poll for status updates when the status is 'new'
  useQuery(GET_INSTANCE, {
    variables: props.variables,
    pollInterval: 5000
  });

  return <Status color="gold">Starting up...</Status>;
}

NewStatus.propTypes = {
  variables: PropTypes.object.isRequired
};

function Status(props) {
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

Status.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default function InstanceStatus(props) {
  switch (props.instance.status) {
    case 'new':
      return <NewStatus variables={{id: props.instance.id}} />;
    case 'active':
      if (props.instance.tags.includes('ready')) {
        return <Status color="limegreen">Active</Status>;
      }
      return <ProvisionInstanceButton instance={props.instance} />;
    default:
      return <Status color="error.main">Unknown</Status>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

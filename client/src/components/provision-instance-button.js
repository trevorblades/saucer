import PropTypes from 'prop-types';
import React from 'react';
import {INSTANCE_FRAGMENT} from '../utils';
import {IconButton} from '@material-ui/core';
import {gql, useMutation} from '@apollo/client';

const PROVISION_INSTANCE = gql`
  mutation ProvisionInstance($id: ID!) {
    provisionInstance(id: $id) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function ProvisionInstanceButton(props) {
  const [provisionInstance, {loading}] = useMutation(PROVISION_INSTANCE, {
    variables: {
      id: props.instance.id
    }
  });

  return (
    <IconButton disabled={loading} onClick={provisionInstance}>
      P
    </IconButton>
  );
}

ProvisionInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

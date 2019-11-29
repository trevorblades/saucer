import PropTypes from 'prop-types';
import React from 'react';
import {Button} from '@material-ui/core';
import {INSTANCE_FRAGMENT} from '../../utils';
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
    <Button
      size="small"
      disabled={loading}
      onClick={provisionInstance}
      color="primary"
      variant="contained"
    >
      Ready to provision
    </Button>
  );
}

ProvisionInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

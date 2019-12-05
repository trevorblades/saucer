import NewStatus from './new-status';
import PropTypes from 'prop-types';
import React from 'react';
import StatusMessage from './status-message';

export default function InstanceStatus(props) {
  switch (props.instance.status) {
    case 'running':
      return <StatusMessage color="limegreen">Active</StatusMessage>;
    default:
      return <StatusMessage color="gold">Starting</StatusMessage>;
  }

  const {status} = props.instance;
  const isActive = status === 'active';

  if (isActive) {
    if (tags.includes('provisioned')) {
    } else if (isReady) {
      // return <ProvisionInstanceButton instance={props.instance} />;
    }
  }

  if (status === 'new' || (isActive && !isReady)) {
    return <NewStatus variables={{id: props.instance.id}} />;
  }

  return <StatusMessage color="error.main">Unknown</StatusMessage>;
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

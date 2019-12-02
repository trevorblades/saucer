import NewStatus from './new-status';
import PropTypes from 'prop-types';
import ProvisionInstanceButton from './provision-instance-button';
import React from 'react';
import StatusMessage from './status-message';

export default function InstanceStatus(props) {
  const {status, tags} = props.instance;
  const isActive = status === 'active';
  const isReady = tags.includes('ready');

  if (isActive) {
    if (tags.includes('provisioned')) {
      return <StatusMessage color="limegreen">Active</StatusMessage>;
    } else if (isReady) {
      return <ProvisionInstanceButton instance={props.instance} />;
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

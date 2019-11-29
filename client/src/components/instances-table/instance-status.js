import NewStatus from './new-status';
import PropTypes from 'prop-types';
import ProvisionInstanceButton from './provision-instance-button';
import React from 'react';
import StatusMessage from './status-message';

export default function InstanceStatus(props) {
  switch (props.instance.status) {
    case 'new':
      return <NewStatus variables={{id: props.instance.id}} />;
    case 'active':
      if (props.instance.tags.includes('ready')) {
        return <StatusMessage color="limegreen">Active</StatusMessage>;
      }
      return <ProvisionInstanceButton instance={props.instance} />;
    default:
      return <StatusMessage color="error.main">Unknown</StatusMessage>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

import PropTypes from 'prop-types';
import ProvisionInstanceButton from './provision-instance-button';
import React, {Fragment} from 'react';

export default function InstanceStatus(props) {
  switch (props.instance.status) {
    case 'new':
      return <Fragment>Starting up...</Fragment>;
    case 'active':
      if (props.instance.tags.includes('ready')) {
        return <Fragment>Active</Fragment>;
      }
      return <ProvisionInstanceButton instance={props.instance} />;
    default:
      return <Fragment>Unknown status</Fragment>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';

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

export default function InstanceStatus(props) {
  const {status} = props.instance;
  switch (status) {
    case 'Success':
      return <StatusMessage color="limegreen">Ready</StatusMessage>;
    case 'Pending':
    case 'Delayed':
    case 'InProgress':
      return <StatusMessage color="gold">Starting</StatusMessage>;
    case 'TimedOut':
    case 'Failed':
      return <StatusMessage color="error.main">Failed</StatusMessage>;
    default:
      return <StatusMessage color="lightgrey">{status}</StatusMessage>;
  }
}

InstanceStatus.propTypes = {
  instance: PropTypes.object.isRequired
};

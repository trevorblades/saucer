import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';

export default function StatusMessage(props) {
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

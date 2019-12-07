import PropTypes from 'prop-types';
import React from 'react';
import {Box, useTheme} from '@material-ui/core';
import {FaWordpressSimple} from 'react-icons/fa';

export default function InstanceIcon(props) {
  const {palette} = useTheme();
  const segments = props.name.split('-');
  const color = '#' + segments[segments.length - 1];
  return (
    <Box
      display="flex"
      p={0.5}
      mr={2}
      borderRadius="borderRadius"
      bgcolor={color}
    >
      <FaWordpressSimple size={20} fill={palette.getContrastText(color)} />
    </Box>
  );
}

InstanceIcon.propTypes = {
  name: PropTypes.string.isRequired
};

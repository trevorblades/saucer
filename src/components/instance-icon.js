import PropTypes from 'prop-types';
import React from 'react';
import {Box, useTheme} from '@material-ui/core';
import {FaWordpressSimple} from 'react-icons/fa';

export default function InstanceIcon({name, ...props}) {
  const {palette} = useTheme();

  // the last segment in an instance id is a color hex code
  const segments = name.split('-');
  const color = '#' + segments[segments.length - 1];
  return (
    <Box
      display="flex"
      p="0.25em"
      borderRadius="calc(100% / 3)"
      bgcolor={color}
      {...props}
    >
      <FaWordpressSimple size="1em" fill={palette.getContrastText(color)} />
    </Box>
  );
}

InstanceIcon.propTypes = {
  name: PropTypes.string.isRequired
};

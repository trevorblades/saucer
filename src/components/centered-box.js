import PropTypes from 'prop-types';
import React from 'react';
import {Box, useTheme} from '@material-ui/core';

export default function CenteredBox({offset, ...props}) {
  const {breakpoints} = useTheme();
  return (
    <Box
      width="100%"
      maxWidth={breakpoints.values.lg - offset}
      mx="auto"
      {...props}
    />
  );
}

CenteredBox.defaultProps = {
  offset: 0
};

CenteredBox.propTypes = {
  offset: PropTypes.number
};

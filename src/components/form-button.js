import PropTypes from 'prop-types';
import React from 'react';
import {Box, CardActionArea, useTheme} from '@material-ui/core';

export default function FormButton({disabled, selected, children, ...props}) {
  const {shape} = useTheme();
  return (
    <CardActionArea
      {...props}
      disabled={disabled}
      style={{
        height: '100%',
        borderRadius: shape.borderRadius
      }}
    >
      <Box
        p={2.5}
        height={1}
        border={1}
        borderColor={selected ? 'primary.main' : 'divider'}
        color={disabled ? 'action.disabled' : 'inherit'}
        borderRadius="inherit"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {children}
      </Box>
    </CardActionArea>
  );
}

FormButton.propTypes = {
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  children: PropTypes.node.isRequired
};

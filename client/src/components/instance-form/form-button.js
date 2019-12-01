import PropTypes from 'prop-types';
import React from 'react';
import {Box, CardActionArea, useTheme} from '@material-ui/core';

export default function FormButton(props) {
  const {shape} = useTheme();
  return (
    <CardActionArea
      disabled={props.disabled}
      style={{
        height: '100%',
        borderRadius: shape.borderRadius
      }}
    >
      <Box
        p={2}
        height={1}
        border={1}
        borderColor={props.selected ? 'primary.main' : 'divider'}
        color={props.disabled ? 'action.disabled' : 'inherit'}
        borderRadius="inherit"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box component={props.icon} mb={1} size={32} />
        {props.children}
      </Box>
    </CardActionArea>
  );
}

FormButton.propTypes = {
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  icon: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

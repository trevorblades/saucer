import PropTypes from 'prop-types';
import React from 'react';
import {Box, CardActionArea, Typography, useTheme} from '@material-ui/core';

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
        p={2.5}
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
        {props.children}
      </Box>
    </CardActionArea>
  );
}

FormButton.propTypes = {
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export function PlatformButton({icon, label, caption, ...props}) {
  return (
    <FormButton {...props}>
      <Box component={icon} mb={1} size={32} />
      <Typography>{label}</Typography>
      {caption && <Typography variant="caption">{caption}</Typography>}
    </FormButton>
  );
}

PlatformButton.propTypes = {
  icon: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  caption: PropTypes.string
};

export function PaymentOption({cost, label, ...props}) {
  return (
    <FormButton {...props}>
      <Typography variant="h6">{cost}</Typography>
      <Typography variant="body2">{label}</Typography>
    </FormButton>
  );
}

PaymentOption.propTypes = {
  cost: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

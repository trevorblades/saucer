import PropTypes from 'prop-types';
import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select
} from '@material-ui/core';

export default function LabeledSelect({label, helperText, ...props}) {
  return (
    <FormControl margin="normal" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select {...props} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

LabeledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  helperText: PropTypes.node
};

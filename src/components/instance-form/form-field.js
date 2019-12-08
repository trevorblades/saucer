import React, {useState} from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip
} from '@material-ui/core';
import {FiEye, FiEyeOff} from 'react-icons/fi';

export default function FormField(props) {
  return <TextField fullWidth margin="normal" {...props} />;
}

export function PasswordField(props) {
  const [passwordShown, setPasswordShown] = useState(false);

  function togglePasswordShown() {
    setPasswordShown(prevPasswordShown => !prevPasswordShown);
  }

  return (
    <FormField
      type={passwordShown ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment>
            <Tooltip title={`${passwordShown ? 'Hide' : 'Reveal'} password`}>
              <IconButton size="small" onClick={togglePasswordShown}>
                <Box component={passwordShown ? FiEye : FiEyeOff} size={20} />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
      {...props}
    />
  );
}

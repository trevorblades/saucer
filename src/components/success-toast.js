import PropTypes from 'prop-types';
import React from 'react';
import {FiX} from 'react-icons/fi';
import {IconButton, Snackbar} from '@material-ui/core';

export default function SuccessToast({onClose, ...props}) {
  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') return;
    onClose();
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      autoHideDuration={3000}
      action={
        <IconButton onClick={onClose} size="small" color="inherit">
          <FiX size={20} />
        </IconButton>
      }
      onClose={handleSnackbarClose}
      {...props}
    />
  );
}

SuccessToast.propTypes = {
  onClose: PropTypes.func.isRequired
};

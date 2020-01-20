import PropTypes from 'prop-types';
import React from 'react';
import {FiX} from 'react-icons/fi';
import {IconButton, Snackbar} from '@material-ui/core';

export default function SuccessToast(props) {
  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    props.onClose();
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      autoHideDuration={3000}
      action={
        <IconButton onClick={props.onClose} size="small" color="inherit">
          <FiX size={20} />
        </IconButton>
      }
      open={props.open}
      onClose={handleSnackbarClose}
      message={props.message}
    />
  );
}

SuccessToast.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired
};

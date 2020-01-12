import DeleteInstanceDialog from '../delete-instance-dialog';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {Box, Button} from '@material-ui/core';
import {navigate} from 'gatsby';

export default function DeleteInstanceButton(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  function handleCompleted() {
    navigate('/dashboard');
  }

  return (
    <Fragment>
      <Box color="error.main">
        <Button variant="outlined" color="inherit" onClick={openDialog}>
          Delete instance
        </Button>
      </Box>
      <DeleteInstanceDialog
        instance={props.instance}
        open={dialogOpen}
        onClose={closeDialog}
        onCompleted={handleCompleted}
      />
    </Fragment>
  );
}

DeleteInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

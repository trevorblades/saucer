import PropTypes from 'prop-types';
import ProvisionForm from './provision-form';
import React, {Fragment, useState} from 'react';
import {Button, Dialog} from '@material-ui/core';

export default function ProvisionInstanceButton(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleClick() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Button
        size="small"
        onClick={handleClick}
        color="primary"
        variant="contained"
      >
        Ready to provision
      </Button>
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <ProvisionForm
          variables={{id: props.instance.id}}
          onCancel={closeDialog}
        />
      </Dialog>
    </Fragment>
  );
}

ProvisionInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

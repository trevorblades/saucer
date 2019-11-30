import PropTypes from 'prop-types';
import ProvisionForm from './provision-form';
import React, {Fragment, useState} from 'react';
import {Chip, Dialog} from '@material-ui/core';

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
      <Chip
        clickable
        onClick={handleClick}
        label="Ready to provision"
        color="primary"
        size="small"
      />
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

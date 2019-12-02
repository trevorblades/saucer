import PropTypes from 'prop-types';
import ProvisionForm from './provision-form';
import React, {Fragment, useState} from 'react';
import {Chip, Drawer} from '@material-ui/core';

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
      <Drawer open={dialogOpen} onClose={closeDialog} anchor="right">
        <ProvisionForm variables={{id: props.instance.id}} />
      </Drawer>
    </Fragment>
  );
}

ProvisionInstanceButton.propTypes = {
  instance: PropTypes.object.isRequired
};

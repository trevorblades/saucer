import PaymentPlanForm from './payment-plan-form';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {Button, Dialog} from '@material-ui/core';

export default function PaymentPlanButton(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        size={props.size}
        onClick={openDialog}
      >
        Add payment plan
      </Button>
      <Dialog fullWidth maxWidth="xs" open={dialogOpen} onClose={closeDialog}>
        <PaymentPlanForm
          instance={props.instance}
          defaultCard={props.defaultCard}
          onCancel={closeDialog}
          onCompleted={props.onCompleted}
        />
      </Dialog>
    </Fragment>
  );
}

PaymentPlanButton.propTypes = {
  instance: PropTypes.object.isRequired,
  defaultCard: PropTypes.object,
  size: PropTypes.string,
  onCompleted: PropTypes.func
};

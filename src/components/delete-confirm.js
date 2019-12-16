import DialogHeader from './dialog-header';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText
} from '@material-ui/core';
import {useMutation} from '@apollo/client';

export default function DeleteConfirm(props) {
  const [mutate, {loading, error}] = useMutation(
    props.mutation,
    props.mutationOptions
  );

  return (
    <Fragment>
      <DialogContent>
        <DialogHeader image={props.image}>Are you sure?</DialogHeader>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
        {props.children}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button disabled={loading} onClick={mutate} color="primary">
          Yes, delete it
        </Button>
      </DialogActions>
    </Fragment>
  );
}

DeleteConfirm.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onCancel: PropTypes.func.isRequired,
  mutation: PropTypes.object.isRequired,
  mutationOptions: PropTypes.object.isRequired
};

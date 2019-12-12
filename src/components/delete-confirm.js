import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography
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
        <Box
          component="img"
          display="block"
          mx="auto"
          src={props.image}
          height={200}
        />
        <Typography paragraph align="center" variant="h5">
          Are you sure?
        </Typography>
        {error && (
          <Typography paragraph color="error">
            {error.message}
          </Typography>
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

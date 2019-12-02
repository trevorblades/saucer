import FormButton from './form-button';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import visa from 'payment-icons/min/flat/visa.svg';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {INSTANCE_FRAGMENT, LIST_INSTANCES} from '../../utils';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {gql, useMutation} from '@apollo/client';

const CREATE_INSTANCE = gql`
  mutation CreateInstance($name: String!) {
    createInstance(name: $name) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function InstanceForm(props) {
  const [createInstance, {loading}] = useMutation(CREATE_INSTANCE, {
    onCompleted: props.onCancel,
    update(cache, {data}) {
      const {instances} = cache.readQuery({
        query: LIST_INSTANCES
      });

      cache.writeQuery({
        query: LIST_INSTANCES,
        data: {
          instances: [...instances, data.createInstance]
        }
      });
    }
  });

  const name = useMemo(
    () =>
      uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        separator: '-'
      }),
    []
  );

  function handleSubmit(event) {
    event.preventDefault();
    createInstance({
      variables: {
        name: event.target.name.value
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>What do you want to build?</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormButton selected icon={FaWordpressSimple}>
              <Typography>Wordpress</Typography>
            </FormButton>
          </Grid>
          <Grid item xs={6}>
            <FormButton disabled icon={FaDrupal}>
              <Typography>Drupal</Typography>
              <Typography variant="caption">(Coming later)</Typography>
            </FormButton>
          </Grid>
        </Grid>
        <TextField
          fullWidth
          value={name}
          margin="normal"
          label="Instance name"
          name="name"
          required
          disabled
        />
        <FormControl margin="normal" fullWidth>
          <InputLabel>Payment method</InputLabel>
          <Select value="1">
            <MenuItem value="1">
              <Box
                component="img"
                src={visa}
                height="1em"
                mr={1}
                style={{verticalAlign: '-0.1em'}}
              />
              Visa 4242 (default)
            </MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button disabled={loading} type="submit" color="primary">
          Create instance
        </Button>
      </DialogActions>
    </form>
  );
}

InstanceForm.propTypes = {
  onCancel: PropTypes.func.isRequired
};

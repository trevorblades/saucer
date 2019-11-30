import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField
} from '@material-ui/core';
import {INSTANCE_FRAGMENT} from '../../utils';
import {gql, useMutation} from '@apollo/client';

const PROVISION_INSTANCE = gql`
  mutation ProvisionInstance(
    $id: ID!
    $email: String!
    $username: String!
    $password: String!
    $title: String!
  ) {
    provisionInstance(
      id: $id
      email: $email
      username: $username
      password: $password
      title: $title
    ) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

function FormField(props) {
  return <TextField required fullWidth margin="normal" {...props} />;
}

function GridItem(props) {
  return <Grid item xs={6} {...props} />;
}

export default function ProvisionForm(props) {
  const [provisionInstance, {loading, error}] = useMutation(
    PROVISION_INSTANCE,
    {
      onCompleted: props.onCancel,
      variables: props.variables
    }
  );

  function handleSubmit(event) {
    event.preventDefault();

    const {email, password, username, title} = event.target;
    provisionInstance({
      variables: {
        email: email.value,
        password: password.value,
        username: username.value,
        title: title.value
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Provision your instance</DialogTitle>
      <DialogContent>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
        <DialogContentText>
          Complete your Wordpress installation with the following information.
          You will use this username/password combination to log in to your
          Wordpress site.
        </DialogContentText>
        <Grid container>
          <GridItem>
            <FormField label="Blog title" name="title" />
          </GridItem>
          <GridItem>
            <FormField label="Email address" name="email" type="email" />
          </GridItem>
          <GridItem>
            <FormField label="Username" name="username" />
          </GridItem>
          <GridItem>
            <FormField label="Password" name="password" type="password" />
          </GridItem>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button type="submit" color="primary" disabled={loading}>
          Submit
        </Button>
      </DialogActions>
    </form>
  );
}

ProvisionForm.propTypes = {
  variables: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired
};

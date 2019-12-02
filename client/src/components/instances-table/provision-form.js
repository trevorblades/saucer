import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import mirageComeBackLater from '../../assets/mirage-come-back-later.png';
import {Box, CardActionArea, TextField, Typography} from '@material-ui/core';
import {FiDownloadCloud} from 'react-icons/fi';
import {INSTANCE_FRAGMENT, UserContext} from '../../utils';
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
  return (
    <TextField
      required
      fullWidth
      margin="normal"
      variant="outlined"
      {...props}
    />
  );
}

export default function ProvisionForm(props) {
  const user = useContext(UserContext);
  const [provisionInstance, {loading, error}] = useMutation(
    PROVISION_INSTANCE,
    {variables: props.variables}
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
    <Box
      width={500}
      height="100%"
      display="flex"
      flexDirection="column"
      component="form"
      onSubmit={handleSubmit}
      position="relative"
      zIndex={0}
    >
      <Box p={3}>
        <Box
          display="block"
          component="img"
          src={mirageComeBackLater}
          height={200}
          mx="auto"
        />
        <Typography gutterBottom variant="h5" align="center">
          Provision your instance
        </Typography>
        {error && (
          <Typography gutterBottom color="error">
            {error.message}
          </Typography>
        )}
        <Typography paragraph>
          Enter the following information to complete your Wordpress
          installation. You will use this username/password combination to log
          in to your Wordpress admin area.
        </Typography>
        <FormField
          autoFocus
          disabled={loading}
          label="Website title"
          placeholder="Acme Inc."
          name="title"
        />
        <FormField
          disabled={loading}
          defaultValue={user.email}
          label="Email address"
          name="email"
          type="email"
        />
        <FormField
          disabled={loading}
          defaultValue="admin"
          label="Username"
          name="username"
        />
        <FormField
          disabled={loading}
          label="Password"
          name="password"
          type="password"
        />
      </Box>
      <Box
        mt="auto"
        position="sticky"
        bottom={0}
        zIndex={1}
        bgcolor="background.paper"
      >
        <CardActionArea type="submit" disabled={loading}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor={loading ? 'action.disabled' : 'primary.main'}
            p={2}
            color="white"
          >
            <Typography variant="button">
              <Box component="span" fontSize="body1.fontSize">
                Install Wordpress
              </Box>
            </Typography>
            <Box component={FiDownloadCloud} ml={2} size={24} />
          </Box>
        </CardActionArea>
      </Box>
    </Box>
  );
}

ProvisionForm.propTypes = {
  variables: PropTypes.object.isRequired
};

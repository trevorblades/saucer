import FormButton from './form-button';
import PropTypes from 'prop-types';
import React, {useContext, useMemo, useState} from 'react';
import randomstring from 'randomstring';
import visa from 'payment-icons/min/flat/visa.svg';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {FiEye, FiEyeOff} from 'react-icons/fi';
import {INSTANCE_FRAGMENT, LIST_INSTANCES, UserContext} from '../../utils';
import {
  adjectives,
  animals,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {gql, useMutation} from '@apollo/client';

// TODO: enable configuring locale in create dialog
const CREATE_INSTANCE = gql`
  mutation CreateInstance(
    $name: String!
    $locale: String!
    $title: String!
    $adminEmail: String!
    $adminUser: String!
    $adminPassword: String!
  ) {
    createInstance(
      name: $name
      locale: $locale
      title: $title
      adminEmail: $adminEmail
      adminUser: $adminUser
      adminPassword: $adminPassword
    ) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

function FormField(props) {
  return <TextField required fullWidth margin="normal" {...props} />;
}

function PasswordField(props) {
  const [passwordShown, setPasswordShown] = useState(false);

  function togglePasswordShown() {
    setPasswordShown(prevPasswordShown => !prevPasswordShown);
  }

  return (
    <FormField
      type={passwordShown ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment>
            <Tooltip title={`${passwordShown ? 'Hide' : 'Reveal'} password`}>
              <IconButton size="small" onClick={togglePasswordShown}>
                <Box component={passwordShown ? FiEye : FiEyeOff} size={20} />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
      {...props}
    />
  );
}

export default function InstanceForm(props) {
  const user = useContext(UserContext);
  const [createInstance, {loading, error}] = useMutation(CREATE_INSTANCE, {
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
        dictionaries: [adjectives, animals],
        length: 2,
        separator: '-'
      }) +
      '-' +
      randomstring.generate(6),
    []
  );

  function handleSubmit(event) {
    event.preventDefault();

    const {name, title, adminEmail, adminUser, adminPassword} = event.target;
    createInstance({
      variables: {
        name: name.value,
        locale: 'en_US',
        title: title.value,
        adminEmail: adminEmail.value,
        adminUser: adminUser.value,
        adminPassword: adminPassword.value
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>What do you want to build?</DialogTitle>
      <DialogContent>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
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
        <FormField value={name} label="Instance name" name="name" disabled />
        <FormField placeholder="Acme blog" label="Title" name="title" />
        <FormField
          defaultValue={user.email}
          label="Admin email"
          name="adminEmail"
          type="email"
        />
        <FormField
          defaultValue="admin"
          label="Admin username"
          name="adminUser"
        />
        <PasswordField
          helperText="You will use this to log in to your Wordpress installation"
          label="Admin password"
          name="adminPassword"
        />
        <FormControl margin="normal" fullWidth>
          <InputLabel>Payment method</InputLabel>
          <Select value="1">
            <MenuItem value="1">
              <Box component="span" display="flex" alignItems="center">
                <Box component="img" src={visa} height="1em" mr={1} />
                Trevor Blades xxxx-4242
              </Box>
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

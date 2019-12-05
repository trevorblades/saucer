import FormButton from './form-button';
import FormField, {PasswordField} from './form-field';
import PropTypes from 'prop-types';
import React, {useContext, useMemo, useState} from 'react';
import localeEmoji from 'locale-emoji';
import mirageComeBackLater from '../../assets/mirage-come-back-later.png';
import randomstring from 'randomstring';
import visa from 'payment-icons/min/flat/visa.svg';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {INSTANCE_FRAGMENT, LIST_INSTANCES, UserContext} from '../../utils';
import {
  adjectives,
  animals,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {gql, useMutation} from '@apollo/client';

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

function LabeledSelect({label, ...props}) {
  return (
    <FormControl margin="normal" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select {...props} />
    </FormControl>
  );
}

LabeledSelect.propTypes = {
  label: PropTypes.string.isRequired
};

const locales = {
  English: 'en_US',
  'English (UK)': 'en_GB',
  Русский: 'ru_RU',
  Deutsch: 'de_DE',
  日本語: 'ja',
  Español: 'es_ES',
  Français: 'fr_FR',
  Português: 'pt_PT',
  'Português do Brasil': 'pt_BR',
  简体中文: 'zh_CN',
  Italiano: 'it_IT',
  Polski: 'pl_PL',
  한국어: 'ko_KR',
  हिन्दी: 'hi_IN',
  Svenska: 'sv_SE'
};

export default function InstanceForm(props) {
  const user = useContext(UserContext);
  const [locale, setLocale] = useState('en_US');
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
        locale,
        title: title.value,
        adminEmail: adminEmail.value,
        adminUser: adminUser.value,
        adminPassword: adminPassword.value
      }
    });
  }

  function handleLocaleChange(event) {
    setLocale(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <Box textAlign="center" mb={3}>
          <img src={mirageComeBackLater} height={150} />
          <Typography variant="h5">What do you want to build today?</Typography>
        </Box>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormButton selected disabled={loading} icon={FaWordpressSimple}>
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
        <FormField
          required
          value={name}
          label="Instance name"
          name="name"
          disabled
        />
        <FormField
          autoFocus
          required
          disabled={loading}
          placeholder="Acme blog"
          label="Title"
          name="title"
        />
        <FormField
          required
          disabled={loading}
          defaultValue={user.email}
          label="Admin email"
          name="adminEmail"
          type="email"
        />
        <FormField
          required
          disabled={loading}
          defaultValue="admin"
          label="Admin username"
          name="adminUser"
        />
        <PasswordField
          required
          disabled={loading}
          helperText="You will use this to log in to your Wordpress installation"
          label="Admin password"
          name="adminPassword"
        />
        <LabeledSelect
          label="Locale"
          value={locale}
          onChange={handleLocaleChange}
        >
          {Object.entries(locales).map(([label, code]) => (
            <MenuItem key={label} value={code}>
              {localeEmoji(code)} {label}
            </MenuItem>
          ))}
        </LabeledSelect>
        <LabeledSelect label="Payment method" value="1">
          <MenuItem value="1">
            <Box component="span" display="flex" alignItems="center">
              <Box component="img" src={visa} height="1em" mr={1} />
              Trevor Blades xxxx-4242
            </Box>
          </MenuItem>
        </LabeledSelect>
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

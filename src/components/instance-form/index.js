import FormButton from './form-button';
import FormField, {PasswordField} from './form-field';
import PropTypes from 'prop-types';
import React, {Fragment, useContext, useState} from 'react';
import localeEmoji from 'locale-emoji';
import mirageComeBackLater from '../../assets/mirage-come-back-later.png';
import visa from 'payment-icons/min/flat/visa.svg';
import {
  Box,
  CardActionArea,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {FiUploadCloud} from 'react-icons/fi';
import {INSTANCE_FRAGMENT, LIST_INSTANCES, UserContext} from '../../utils';
import {gql, useMutation} from '@apollo/client';

const CREATE_INSTANCE = gql`
  mutation CreateInstance(
    $title: String!
    $locale: String!
    $adminEmail: String!
    $adminUser: String!
    $adminPassword: String!
  ) {
    createInstance(
      title: $title
      locale: $locale
      adminEmail: $adminEmail
      adminUser: $adminUser
      adminPassword: $adminPassword
    ) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

function LabeledSelect({label, helperText, ...props}) {
  return (
    <FormControl margin="normal" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select {...props} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

LabeledSelect.propTypes = {
  label: PropTypes.string.isRequired,
  helperText: PropTypes.node
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
  Svenska: 'sv_SE',
  'Tiếng Việt': 'vi',
  Nederlands: 'nl_NL'
};

export default function InstanceForm(props) {
  const user = useContext(UserContext);
  const [locale, setLocale] = useState('en_US');
  const [createInstance, {loading, error}] = useMutation(CREATE_INSTANCE, {
    onCompleted: props.onCompleted,
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

  function handleSubmit(event) {
    event.preventDefault();

    const {title, adminEmail, adminUser, adminPassword} = event.target;
    createInstance({
      variables: {
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
    <Box width={600} component="form" onSubmit={handleSubmit}>
      <Box py={3} px={4}>
        <Box textAlign="center" mb={3}>
          <img src={mirageComeBackLater} height={180} />
          <Typography variant="h5">What do you want to build today?</Typography>
        </Box>
        {error && (
          <Typography paragraph color="error">
            {error.message}
          </Typography>
        )}
        <Box mb={1}>
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
        </Box>
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
          label="Language"
          helperText={
            <Fragment>
              Don&apos;t see your language?{' '}
              <Link
                href="mailto:hello@saucer.dev?subject=Please add my language"
                target="_blank"
                rel="noopener noreferrer"
              >
                Let us know
              </Link>{' '}
              and we&apos;ll add it.
            </Fragment>
          }
          value={locale}
          disabled={loading}
          onChange={handleLocaleChange}
        >
          {Object.entries(locales).map(([label, code]) => (
            <MenuItem key={label} value={code}>
              {localeEmoji(code)} {label}
            </MenuItem>
          ))}
        </LabeledSelect>
        <Box mt={2}>
          <Typography variant="subtitle2">
            Install more plugins? (optional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                disabled={loading}
                control={<Checkbox />}
                label="Advanced Custom Fields"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                disabled={loading}
                control={<Checkbox />}
                label="WooCommerce"
              />
            </Grid>
          </Grid>
        </Box>
        <LabeledSelect label="Payment method" value="1" disabled={loading}>
          <MenuItem value="1">
            <Box component="span" display="flex" alignItems="center">
              <Box component="img" src={visa} height="1em" mr={1} />
              Trevor Blades xxxx-4242
            </Box>
          </MenuItem>
        </LabeledSelect>
      </Box>
      <Box position="sticky" bottom={0} bgcolor="background.paper">
        <CardActionArea disabled={loading} type="submit">
          <Box
            bgcolor={loading ? 'action.disabled' : 'primary.main'}
            color="white"
            p={2.5}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box component={FiUploadCloud} mr={2} size={24} />
            <Typography variant="button">
              <Box component="span" fontSize="body1.fontSize">
                Create instance
              </Box>
            </Typography>
          </Box>
        </CardActionArea>
      </Box>
    </Box>
  );
}

InstanceForm.propTypes = {
  onCompleted: PropTypes.func.isRequired
};

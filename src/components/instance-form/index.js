import PasswordField from './password-field';
import PropTypes from 'prop-types';
import React, {Fragment, useContext, useState} from 'react';
import localeEmoji from 'locale-emoji';
import puzzle from '../../assets/puzzle.png';
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
  MenuItem,
  Link as MuiLink,
  Select,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {FiUploadCloud} from 'react-icons/fi';
import {
  FormField,
  INSTANCE_FRAGMENT,
  LIST_INSTANCES,
  UserContext,
  locales
} from '../../utils';
import {Link} from 'gatsby';
import {PaymentOption, PlatformButton} from './form-button';
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
          <Box component="img" mb={2} src={puzzle} height={200} />
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
              <PlatformButton
                selected
                disabled={loading}
                icon={FaWordpressSimple}
                label="Wordpress"
              />
            </Grid>
            <Grid item xs={6}>
              <PlatformButton
                disabled
                icon={FaDrupal}
                label="Drupal"
                caption="Coming soon"
              />
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
              <MuiLink
                href="mailto:hello@saucer.dev?subject=Please add my language"
                target="_blank"
                rel="noopener noreferrer"
              >
                Let us know
              </MuiLink>{' '}
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
        <Box my={2}>
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
        <Typography variant="subtitle2">Billing options</Typography>
        <Box my={1.5}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <PaymentOption disabled cost="Free" label="14-day trial" />
            </Grid>
            <Grid item xs={4}>
              <PaymentOption selected cost="$12" label="per month" />
            </Grid>
            <Grid item xs={4}>
              <PaymentOption cost="$120" label="per year" />
            </Grid>
          </Grid>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Trial instances are only available to users with no existing
          instances.
        </Typography>
        <LabeledSelect label="Payment method" value="1" disabled={loading}>
          <MenuItem component={Link} to="/dashboard/billing">
            Add a new card
          </MenuItem>
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

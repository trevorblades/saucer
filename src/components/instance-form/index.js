import CardsSelect from '../cards-select';
import FormField from '../form-field';
import LabeledSelect from '../labeled-select';
import PasswordField from './password-field';
import PropTypes from 'prop-types';
import React, {Fragment, useContext, useRef, useState} from 'react';
import localeEmoji from 'locale-emoji';
import puzzle from '../../assets/puzzle.png';
import {
  Box,
  CardActionArea,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Link as MuiLink,
  Typography
} from '@material-ui/core';
import {FaDrupal, FaWordpressSimple} from 'react-icons/fa';
import {FiUploadCloud} from 'react-icons/fi';
import {
  INSTANCE_FRAGMENT,
  LIST_CARDS,
  LIST_INSTANCES,
  UserContext,
  locales
} from '../../utils';
import {PlanButton, PlanButtonContext, PlatformButton} from './form-button';
import {gql, useMutation} from '@apollo/client';

const CREATE_INSTANCE = gql`
  mutation CreateInstance(
    $title: String!
    $locale: String!
    $adminEmail: String!
    $adminUser: String!
    $adminPassword: String!
    $source: String
  ) {
    createInstance(
      title: $title
      locale: $locale
      adminEmail: $adminEmail
      adminUser: $adminUser
      adminPassword: $adminPassword
      source: $source
    ) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function InstanceForm(props) {
  const user = useContext(UserContext);
  const formRef = useRef(null);
  const [locale, setLocale] = useState('en_US');
  const [plan, setPlan] = useState(props.isTrialDisabled ? 'month' : 'trial');

  const [createInstance, {loading, error}] = useMutation(CREATE_INSTANCE, {
    variables: {locale},
    onError() {
      // scroll to the top of the form to show the error message
      formRef.current.parentNode.scrollTo(0, 0);
    },
    refetchQueries: [{query: LIST_CARDS}],
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

    const {title, adminEmail, adminUser, adminPassword, source} = event.target;
    createInstance({
      variables: {
        title: title.value,
        adminEmail: adminEmail.value,
        adminUser: adminUser.value,
        adminPassword: adminPassword.value,
        source: source && source.value
      }
    });
  }

  function handleLocaleChange(event) {
    setLocale(event.target.value);
  }

  return (
    <Box width={600} component="form" onSubmit={handleSubmit} ref={formRef}>
      <Box py={3} px={4}>
        <Box mb={3}>
          <Box
            display="block"
            mx="auto"
            component="img"
            mb={2}
            src={puzzle}
            height={250}
          />
          <Typography align="center" variant="h5">
            What do you want to build today?
          </Typography>
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
        <Typography variant="subtitle2">Payment options</Typography>
        <Box my={1.5}>
          <PlanButtonContext.Provider value={{plan, setPlan}}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <PlanButton
                  disabled={props.isTrialDisabled}
                  value="trial"
                  cost="Free"
                  label="14-day trial"
                />
              </Grid>
              <Grid item xs={4}>
                <PlanButton value="month" cost="$12" label="per month" />
              </Grid>
              <Grid item xs={4}>
                <PlanButton
                  disabled
                  value="year"
                  cost="$120"
                  label="per year"
                />
              </Grid>
            </Grid>
          </PlanButtonContext.Provider>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Free trial instances are available to users with no existing
          instances.
        </Typography>
        {plan !== 'trial' && (
          <CardsSelect cards={props.cards} name="source" disabled={loading} />
        )}
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
  cards: PropTypes.array.isRequired,
  onCompleted: PropTypes.func.isRequired,
  isTrialDisabled: PropTypes.bool.isRequired
};

import LoginButton from './login-button';
import Logo from './logo';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  NoSsr,
  useTheme
} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {Link} from 'gatsby-theme-material-ui';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {graphql, useStaticQuery} from 'gatsby';
import {useUser} from '../utils';

function NavItem(props) {
  return (
    <ListItem disableGutters>
      <ListItemText>
        <Link color="inherit" {...props} />
      </ListItemText>
    </ListItem>
  );
}

function LayoutInner(props) {
  const {user} = useUser();
  const {breakpoints} = useTheme();
  if (user) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        bgcolor="background.paper"
        mx="auto"
        maxWidth={breakpoints.values.lg}
      >
        <Box p={3} width={320} height="100vh" position="sticky" flexShrink={0}>
          <Box {...LogoTitleProps.root} mb={3}>
            <Box {...LogoTitleProps.logo} component={Logo} />
            <Box {...LogoTitleProps.title}>{props.title}</Box>
          </Box>
          <List component="nav">
            <NavItem to="/">Instances</NavItem>
            <NavItem to="/tools">Tools</NavItem>
            <NavItem to="/billing">Billing</NavItem>
            <NavItem to="/support">Support</NavItem>
            <NavItem to="/account">Account</NavItem>
          </List>
        </Box>
        <Box
          flexGrow={1}
          p={4}
          borderLeft={1}
          borderColor="divider"
          {...props}
        />
      </Box>
    );
  }

  return (
    <Box height="100vh" display="flex">
      <Box m="auto">
        <Box
          component={Logo}
          width={64}
          height={64}
          mb={4}
          display="block"
          mx="auto"
        />
        <LoginButton />
      </Box>
    </Box>
  );
}

LayoutInner.propTypes = {
  title: PropTypes.string.isRequired
};

export default function Layout(props) {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  );

  const {title, description} = data.site.siteMetadata;
  return (
    <Fragment>
      <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`}>
        <meta name="description" content={description} />
        {/* prevent the app from being indexed */}
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* prevent SSR on all pages */}
      <NoSsr>
        <LayoutInner title={title} {...props} />
      </NoSsr>
    </Fragment>
  );
}

import AuthRequired from './auth-required';
import BaseLayout from './base-layout';
import Logo from './logo';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  NoSsr,
  useTheme
} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {Link} from 'gatsby';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {ReactComponent as Wordmark} from '../assets/wordmark.svg';

const navItems = {
  '/dashboard': 'Instances',
  '/dashboard/billing': 'Billing',
  '/dashboard/support': 'Support',
  '/dashboard/account': 'Account',
  '/guide': 'Guide'
};

export default function DashboardLayout(props) {
  const {breakpoints, shape} = useTheme();
  return (
    <BaseLayout>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <NoSsr>
        <AuthRequired>
          <Box
            minHeight="100vh"
            display="flex"
            bgcolor="background.paper"
            mx="auto"
            maxWidth={breakpoints.values.lg}
          >
            <Box
              p={1}
              width={250}
              height="100vh"
              position="sticky"
              top={0}
              flexShrink={0}
              style={{overflow: 'auto'}}
            >
              <Box {...LogoTitleProps.root} p={2}>
                <Logo width="1em" fill="currentColor" />
                <Box
                  component={Wordmark}
                  height="calc(7em / 18)"
                  ml="calc(1em / 3)"
                  fill="currentColor"
                />
              </Box>
              <List component="nav">
                {Object.entries(navItems).map(([path, label]) => (
                  <ListItem
                    button
                    component={Link}
                    key={path}
                    to={path}
                    style={{borderRadius: shape.borderRadius}}
                  >
                    <ListItemText
                      primaryTypographyProps={{
                        color:
                          path === props.pathname
                            ? 'textPrimary'
                            : 'textSecondary'
                      }}
                    >
                      {label}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box
              flexGrow={1}
              display="flex"
              flexDirection="column"
              borderLeft={1}
              borderColor="divider"
            >
              <Box p={4}>{props.children}</Box>
            </Box>
          </Box>
        </AuthRequired>
      </NoSsr>
    </BaseLayout>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  pathname: PropTypes.string.isRequired
};

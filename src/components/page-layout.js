import BaseLayout from './base-layout';
import CenteredBox from './centered-box';
import LogoTitle from './logo-title';
import PropTypes from 'prop-types';
import React from 'react';
import {Box, Typography} from '@material-ui/core';
import {ReactComponent as Favicon} from '../assets/favicon.svg';
import {Link} from 'gatsby';
import {Link as MuiLink} from 'gatsby-theme-material-ui';

function NavLink(props) {
  return (
    <Box component="span" ml={2.5}>
      <MuiLink color="inherit" variant="body1" {...props} />
    </Box>
  );
}

export default function PageLayout(props) {
  return (
    <BaseLayout>
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Box
          component="header"
          bgcolor="background.paper"
          position="sticky"
          top={0}
          zIndex={1}
        >
          <CenteredBox
            display="flex"
            alignItems="center"
            height={64}
            px={3}
            offset={0}
          >
            <LogoTitle component={Link} to="/" />
            <Box component="nav" ml="auto">
              <NavLink to="/quick-start">Quick start</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </Box>
          </CenteredBox>
        </Box>
        {props.children}
        <Box component="footer" mt="auto" bgcolor="black" color="white">
          <CenteredBox px={8} py={6} textAlign="center">
            <Box
              component={Favicon}
              width={40}
              display="block"
              mb={2}
              mx="auto"
            />
            <Typography display="block" variant="caption">
              &copy; {new Date().getFullYear()} Saucer
              <br />
              Illustrations by{' '}
              <MuiLink
                color="inherit"
                href="https://icons8.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouch.pics
              </MuiLink>
            </Typography>
          </CenteredBox>
        </Box>
      </Box>
    </BaseLayout>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired
};

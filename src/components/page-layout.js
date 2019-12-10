import BaseLayout from './base-layout';
import CenteredBox from './centered-box';
import LogoTitle from './logo-title';
import PropTypes from 'prop-types';
import React from 'react';
import {Box, Typography} from '@material-ui/core';
import {ReactComponent as Favicon} from '../assets/favicon.svg';
import {Link} from 'gatsby';
import {Link as MuiLink} from 'gatsby-theme-material-ui';

export default function PageLayout(props) {
  return (
    <BaseLayout>
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Box
          component="header"
          bgcolor="background.paper"
          position="sticky"
          top={0}
        >
          <CenteredBox
            display="flex"
            alignItems="center"
            height={64}
            px={3}
            offset={0}
          >
            <LogoTitle component={Link} to="/" mr="auto" />
            <MuiLink variant="body1" to="/dashboard/">
              Dashboard
            </MuiLink>
          </CenteredBox>
        </Box>
        {props.children}
        <Box component="footer" mt="auto" bgcolor="black" color="white">
          <CenteredBox px={8} py={6}>
            <Box component={Favicon} width={40} display="block" mb={2} />
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

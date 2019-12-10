import LogoTitle from '../components/logo-title';
import React from 'react';
import hero from '../assets/hero.png';
import {Box, Typography, useTheme} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';

export default function Home() {
  const {breakpoints, palette} = useTheme();
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Box bgcolor="background.paper">
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          height={64}
          px={3}
          maxWidth={breakpoints.values.lg}
          mx="auto"
        >
          <LogoTitle mr="auto" />
          <Link variant="body1" to="/dashboard/">
            Dashboard
          </Link>
        </Box>
      </Box>
      <Box
        bgcolor="primary.900"
        color="white"
        style={{
          backgroundImage: `radial-gradient(${[
            palette.primary[900],
            palette.common.black
          ]})`
        }}
      >
        <Box
          width="100%"
          maxWidth={breakpoints.values.lg}
          mx="auto"
          py={12}
          px={8}
          style={{
            backgroundImage: `url(${hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <Box width={1 / 2}>
            <Typography gutterBottom variant="h2">
              Headless Wordpress + GraphQL
            </Typography>
            <Typography paragraph variant="h6">
              Deploy a Wordpress site in minutes and consume the data using your
              favourite JavaScript framework.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box component="footer" mt="auto" bgcolor="grey.100">
        <Box width="100%" maxWidth={breakpoints.values.lg} mx="auto" p={3}>
          <Typography display="block" variant="caption" color="textSecondary">
            &copy; {new Date().getFullYear()} Saucer
            <br />
            Illustrations by{' '}
            <Link
              color="inherit"
              href="https://icons8.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouch.pics
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

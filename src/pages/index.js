import CenteredBox from '../components/centered-box';
import LogoTitle from '../components/logo-title';
import React from 'react';
import ufo from '../assets/ufo.png';
import {Box, Typography} from '@material-ui/core';
import {Button, Link} from 'gatsby-theme-material-ui';

export default function Home() {
  return (
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
          offset={80}
        >
          <LogoTitle mr="auto" />
          <Link variant="body1" to="/dashboard/">
            Dashboard
          </Link>
        </CenteredBox>
      </Box>
      <div
        style={{
          backgroundImage: `url(${ufo})`,
          backgroundSize: 800,
          backgroundPosition: '50vw center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <CenteredBox py={12} px={8}>
          <Box width={1 / 2}>
            <Typography gutterBottom variant="h2">
              Headless Wordpress + GraphQL on demand
            </Typography>
            <Typography paragraph variant="h6">
              Deploy a Wordpress site in minutes and consume the data using your
              favourite JavaScript framework.
            </Typography>
          </Box>
        </CenteredBox>
      </div>
      <Box bgcolor="black" color="white">
        <CenteredBox py={6} px={8} textAlign="center">
          <Typography gutterBottom variant="h3">
            Try Saucer free for 7 days
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Get started
          </Button>
        </CenteredBox>
      </Box>
      <CenteredBox py={6} px={8}>
        <Typography variant="h3">List of features</Typography>
      </CenteredBox>
      <Box component="footer" mt="auto" bgcolor="black" color="white">
        <CenteredBox px={8} py={6}>
          <Typography display="block" variant="caption">
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
        </CenteredBox>
      </Box>
    </Box>
  );
}

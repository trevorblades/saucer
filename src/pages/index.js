import CenteredBox from '../components/centered-box';
import FeaturesList from '../components/features-list';
import PageLayout from '../components/page-layout';
import React from 'react';
import robots from '../assets/robots.png';
import ufo from '../assets/ufo.png';
import {Box, Typography} from '@material-ui/core';
import {Button, Fab} from 'gatsby-theme-material-ui';
import {FiChevronRight} from 'react-icons/fi';

export default function Home() {
  return (
    <PageLayout>
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
              Hassle-free Wordpress with GraphQL
            </Typography>
            <Typography paragraph variant="h6">
              Saucer lets you deploy a headless Wordpress CMS in minutes, and
              access your data using a GraphQL API to build fast websites with
              modern tools.
            </Typography>
            <Fab variant="extended" color="primary">
              Learn more
            </Fab>
          </Box>
        </CenteredBox>
      </div>
      <Box bgcolor="black" color="white">
        <CenteredBox py={6} px={8} textAlign="center">
          <Typography paragraph variant="h4">
            Try Saucer free for 14 days
          </Typography>
          <Button
            to="/dashboard"
            color="inherit"
            variant="outlined"
            size="large"
          >
            Get started
            <Box component={FiChevronRight} size={22} ml={1} mr={-1} />
          </Button>
        </CenteredBox>
      </Box>
      <CenteredBox py={6} px={8} display="flex" alignItems="flex-start">
        <img src={robots} height={400} />
        <Box py={4} ml={6}>
          <Typography gutterBottom variant="h3">
            What&apos;s included?
          </Typography>
          <Typography paragraph variant="h6">
            Every Saucer instance comes pre-installed with everything you need
            to get your Wordpress-backed GraphQL website up and running with no
            hassle. This includes:
          </Typography>
          <FeaturesList />
        </Box>
      </CenteredBox>
    </PageLayout>
  );
}

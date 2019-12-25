import CenteredBox from '../components/centered-box';
import FeaturesList from '../components/features-list';
import HeroButton from '../components/hero-button';
import PageLayout from '../components/page-layout';
import React from 'react';
import dishes from '../assets/dishes.png';
import ufo from '../assets/ufo.jpg';
import {Box, Typography} from '@material-ui/core';
import {Button} from 'gatsby-theme-material-ui';
import {FiChevronRight} from 'react-icons/fi';

export default function Home() {
  return (
    <PageLayout>
      <div
        style={{
          backgroundImage: `url(${ufo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <CenteredBox py={12} px={8}>
          <Box width={1 / 2}>
            <Typography gutterBottom variant="h2">
              Hassle-free headless Wordpress with GraphQL
            </Typography>
            <Typography paragraph variant="h6">
              Saucer lets you deploy a headless Wordpress CMS in minutes, and
              access your data using a GraphQL API to build fast websites with
              modern tools.
            </Typography>
            <HeroButton>Learn more</HeroButton>
          </Box>
        </CenteredBox>
      </div>
      <CenteredBox p={8}>
        <Box
          p={4}
          textAlign="center"
          border={2}
          borderColor="primary.main"
          bgcolor="background.paper"
        >
          <Typography variant="h4">Try Saucer free for 14 days</Typography>
          <Typography paragraph variant="h6">
            No credit card required
          </Typography>
          <Button
            to="/dashboard"
            color="primary"
            variant="contained"
            size="large"
          >
            Get started
            <Box component={FiChevronRight} size={22} ml={1} mr={-1} />
          </Button>
        </Box>
      </CenteredBox>
      <CenteredBox py={6} px={8} display="flex" alignItems="flex-start">
        <img src={dishes} height={500} />
        <Box py={4} ml={5}>
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

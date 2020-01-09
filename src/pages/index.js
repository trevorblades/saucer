import CenteredBox from '../components/centered-box';
import FeaturesList from '../components/features-list';
import HeroButton from '../components/hero-button';
import PageLayout from '../components/page-layout';
import React from 'react';
import dishes from '../assets/dishes.png';
import thumbsUp from '../assets/thumbs-up.png';
import {Box, Typography} from '@material-ui/core';
import {Button} from 'gatsby-theme-material-ui';
import {FiChevronRight} from 'react-icons/fi';

export default function Home() {
  return (
    <PageLayout>
      <div
        style={{
          backgroundImage: `url(${dishes})`,
          backgroundSize: 360,
          backgroundPosition: 'calc(50vw + 32px) center',
          backgroundRepeat: 'no-repeat'
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
      <CenteredBox px={8} py={2}>
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
      <CenteredBox py={10} px={8} display="flex" alignItems="flex-start">
        <div>
          <Typography gutterBottom variant="h3">
            What&apos;s included?
          </Typography>
          <Typography paragraph variant="h6">
            Every Saucer instance comes pre-installed with everything you need
            to get your Wordpress-backed GraphQL website up and running with no
            hassle. This includes:
          </Typography>
          <FeaturesList />
        </div>
        <Box component="img" mx={5} src={thumbsUp} height={360} />
      </CenteredBox>
    </PageLayout>
  );
}

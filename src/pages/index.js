import CenteredBox from '../components/centered-box';
import FeaturesList from '../components/features-list';
import PageLayout from '../components/page-layout';
import React from 'react';
import robots from '../assets/robots.png';
import ufo from '../assets/ufo.png';
import {Box, Typography, makeStyles} from '@material-ui/core';
import {Button} from 'gatsby-theme-material-ui';
import {FiChevronRight} from 'react-icons/fi';

const useStyles = makeStyles({
  heroButton: {
    borderWidth: 2,
    borderRadius: 1000,
    fontSize: '1rem',
    padding: '8px 24px'
  }
});

export default function Home() {
  const {heroButton} = useStyles();
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
            <Button
              size="large"
              variant="outlined"
              color="inherit"
              className={heroButton}
            >
              Learn more
            </Button>
          </Box>
        </CenteredBox>
      </div>
      <CenteredBox px={8}>
        <Box p={4} textAlign="center" border={2} bgcolor="background.paper">
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
        <img src={robots} height={400} />
        <Box py={4} ml={4}>
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

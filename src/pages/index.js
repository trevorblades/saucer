import CenteredBox from '../components/centered-box';
import PageLayout from '../components/page-layout';
import React from 'react';
import ufo from '../assets/ufo.png';
import {Box, Typography} from '@material-ui/core';
import {Button} from 'gatsby-theme-material-ui';
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
          <Typography paragraph variant="h4">
            Try Saucer free for 7 days
          </Typography>
          <Button
            to="/dashboard"
            variant="contained"
            color="primary"
            size="large"
          >
            Get started
            <Box component={FiChevronRight} size={22} ml={1} mr={-1} />
          </Button>
        </CenteredBox>
      </Box>
      <CenteredBox py={6} px={8}>
        <Typography variant="h3">List of features</Typography>
      </CenteredBox>
    </PageLayout>
  );
}

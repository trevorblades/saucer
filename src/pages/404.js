import CenteredBox from '../components/centered-box';
import HeroButton from '../components/hero-button';
import PageLayout from '../components/page-layout';
import React from 'react';
import notFound from '../assets/not-found.png';
import {Box, Typography} from '@material-ui/core';
import {FiChevronLeft} from 'react-icons/fi';
import {Helmet} from 'react-helmet';

export default function NotFound() {
  return (
    <PageLayout>
      <Helmet>
        <title>Page not found</title>
      </Helmet>
      <CenteredBox textAlign="center" p={8}>
        <Box
          component="img"
          src={notFound}
          height={400}
          mb={4}
          display="block"
          mx="auto"
        />
        <Typography paragraph variant="h4">
          Page not found
        </Typography>
        <HeroButton to="/">
          <Box component={FiChevronLeft} size={24} ml={-1} mr={1} />
          Back to home
        </HeroButton>
      </CenteredBox>
    </PageLayout>
  );
}

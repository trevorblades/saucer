import CenteredBox from '../components/centered-box';
import PageLayout from '../components/page-layout';
import React from 'react';
import notFound from '../assets/not-found.png';
import {Box, Typography} from '@material-ui/core';
import {Button} from 'gatsby-theme-material-ui';
import {FiChevronLeft} from 'react-icons/fi';

export default function NotFound() {
  return (
    <PageLayout>
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
        <Button variant="outlined" to="/">
          <Box component={FiChevronLeft} size={20} ml={-1} mr={1} />
          Go back to home
        </Button>
      </CenteredBox>
    </PageLayout>
  );
}

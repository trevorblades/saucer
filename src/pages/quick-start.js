import CenteredBox from '../components/centered-box';
import PageLayout from '../components/page-layout';
import React from 'react';
import {Helmet} from 'react-helmet';
import {Typography} from '@material-ui/core';

export default function QuickStart() {
  return (
    <PageLayout>
      <Helmet>
        <title>Quick start</title>
      </Helmet>
      <CenteredBox px={8} py={10}>
        <Typography variant="h2">Quick start</Typography>
      </CenteredBox>
    </PageLayout>
  );
}

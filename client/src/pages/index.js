import Layout from '../components/layout';
import LoginButton from '../components/login-button';
import React from 'react';
import {Box} from '@material-ui/core';

export default function Index() {
  return (
    <Layout>
      <Box p={4}>
        <LoginButton />
      </Box>
    </Layout>
  );
}

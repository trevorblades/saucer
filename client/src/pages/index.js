import Header from '../components/header';
import InstancesTable from '../components/instances-table';
import Layout from '../components/layout';
import LoginButton from '../components/login-button';
import React, {Fragment} from 'react';
import {Box, Typography} from '@material-ui/core';
import {useUser} from '../utils';

export default function Index() {
  const {user} = useUser();
  return (
    <Layout>
      {user ? (
        <Fragment>
          <Header />
          <Box p={4}>
            <Typography gutterBottom variant="h3">
              My instances
            </Typography>
            <InstancesTable />
          </Box>
        </Fragment>
      ) : (
        <Box height="100vh" display="flex">
          <Box m="auto">
            <LoginButton />
          </Box>
        </Box>
      )}
    </Layout>
  );
}

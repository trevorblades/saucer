import CreateInstanceButton from '../components/create-instance-button';
import InstancesTable from '../components/instances-table';
import Layout from '../components/layout';
import React from 'react';
import {Box, Typography} from '@material-ui/core';

export default function Index() {
  return (
    <Layout>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4">My instances</Typography>
        <CreateInstanceButton />
      </Box>
      <InstancesTable />
    </Layout>
  );
}

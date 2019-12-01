import CreateInstanceButton from '../components/create-instance-button';
import InstancesTable from '../components/instances-table';
import React, {Fragment} from 'react';
import {Box, Typography} from '@material-ui/core';

export default function Home() {
  return (
    <Fragment>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4">My instances</Typography>
        <CreateInstanceButton color="primary" variant="outlined" />
      </Box>
      <InstancesTable />
    </Fragment>
  );
}

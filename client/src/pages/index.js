import CreateInstanceButton from '../components/create-instance-button';
import InstancesTable from '../components/instances-table';
import React, {Fragment} from 'react';
import {Box, Typography} from '@material-ui/core';
import {LIST_INSTANCES} from '../utils';
import {useQuery} from '@apollo/client';

export default function Home() {
  const {data, loading, error} = useQuery(LIST_INSTANCES);
  return (
    <Fragment>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h3">My instances</Typography>
        {data && data.instances.length > 0 && (
          <CreateInstanceButton
            color="primary"
            variant="outlined"
            size="large"
          />
        )}
      </Box>
      <InstancesTable data={data} loading={loading} error={error} />
    </Fragment>
  );
}

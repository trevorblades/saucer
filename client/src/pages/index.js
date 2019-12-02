import InstanceForm from '../components/instance-form';
import InstancesTable from '../components/instances-table';
import React, {Fragment, useState} from 'react';
import {Box, Button, Dialog, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {LIST_INSTANCES} from '../utils';
import {useQuery} from '@apollo/client';

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {data, loading, error} = useQuery(LIST_INSTANCES);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <Helmet>
        <title>Instances</title>
      </Helmet>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4">My instances</Typography>
        {data && data.instances.length > 0 && (
          <Button onClick={openDialog} color="primary" variant="outlined">
            Create instance
          </Button>
        )}
      </Box>
      <InstancesTable
        data={data}
        loading={loading}
        error={error}
        onCreateInstance={openDialog}
      />
      <Dialog fullWidth open={dialogOpen} onClose={closeDialog}>
        <InstanceForm onCancel={closeDialog} />
      </Dialog>
    </Fragment>
  );
}

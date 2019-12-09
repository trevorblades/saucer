import InstanceForm from '../components/instance-form';
import InstancesTable from '../components/instances-table';
import React, {Fragment, useState} from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Snackbar,
  Typography
} from '@material-ui/core';
import {FiX} from 'react-icons/fi';
import {Helmet} from 'react-helmet';
import {LIST_INSTANCES} from '../utils';
import {useQuery} from '@apollo/client';

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const {data, loading, error} = useQuery(LIST_INSTANCES);

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  }

  function handleCompleted() {
    closeDialog();
    setSnackbarOpen(true);
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
      <Drawer anchor="right" open={dialogOpen} onClose={closeDialog}>
        <InstanceForm onCancel={closeDialog} onCompleted={handleCompleted} />
      </Drawer>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Instance created 🎉"
        action={
          <IconButton size="small" color="inherit">
            <FiX size={20} />
          </IconButton>
        }
      />
    </Fragment>
  );
}

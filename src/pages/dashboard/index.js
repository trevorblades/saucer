import InstanceForm from '../../components/instance-form';
import InstancesTable from '../../components/instances-table';
import QueryTable from '../../components/query-table';
import React, {Fragment, useState} from 'react';
import egg from '../../assets/egg.png';
import {Drawer, IconButton, Snackbar} from '@material-ui/core';
import {FiX} from 'react-icons/fi';
import {Helmet} from 'react-helmet';
import {LIST_INSTANCES} from '../../utils';

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  }

  function handleCompleted() {
    closeDrawer();
    setSnackbarOpen(true);
  }

  return (
    <Fragment>
      <Helmet>
        <title>Instances</title>
      </Helmet>
      <QueryTable
        title="My instances"
        query={LIST_INSTANCES}
        dataKey="instances"
        EmptyStateProps={{
          image: egg,
          title: 'You have no instances',
          subtitle: "Luckily, it's really easy to create one!",
          buttonText: 'Create instance',
          onButtonClick: openDrawer
        }}
        renderTable={data => <InstancesTable instances={data.instances} />}
      >
        {hasInstances => (
          <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
            <InstanceForm
              isTrialDisabled={hasInstances}
              onCompleted={handleCompleted}
            />
          </Drawer>
        )}
      </QueryTable>
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

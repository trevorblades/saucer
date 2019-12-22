import InstanceForm from '../../components/instance-form';
import InstancesTable from '../../components/instances-table';
import QueryTable from '../../components/query-table';
import React, {Fragment, useState} from 'react';
import egg from '../../assets/egg.png';
import {Drawer} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {LIST_INSTANCES} from '../../utils';
import {navigate} from 'gatsby';

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleCompleted(data) {
    navigate(`/dashboard/instances/${data.createInstance.id}`);
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
        renderTable={data => (
          <InstancesTable instances={data.instances} cards={data.cards} />
        )}
      >
        {data => (
          <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
            <InstanceForm
              isTrialDisabled={data.instances.length > 0}
              cards={data.cards}
              onCompleted={handleCompleted}
            />
          </Drawer>
        )}
      </QueryTable>
    </Fragment>
  );
}

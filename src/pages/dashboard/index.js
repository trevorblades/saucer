import InstanceForm from '../../components/instance-form';
import InstancesTable from '../../components/instances-table';
import QueryTable, {useQueryTable} from '../../components/query-table';
import React, {Fragment} from 'react';
import SuccessToast from '../../components/success-toast';
import egg from '../../assets/egg.png';
import {Drawer} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {LIST_INSTANCES} from '../../utils';

export default function Dashboard() {
  const {
    modalOpen,
    openModal,
    closeModal,
    snackbarOpen,
    closeSnackbar,
    handleCompleted
  } = useQueryTable();
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
          onButtonClick: openModal
        }}
        renderTable={data => (
          <InstancesTable instances={data.instances} cards={data.cards} />
        )}
      >
        {data => (
          <Drawer anchor="right" open={modalOpen} onClose={closeModal}>
            <InstanceForm
              isTrialDisabled={data.instances.length > 0}
              cards={data.cards}
              onCompleted={handleCompleted}
            />
          </Drawer>
        )}
      </QueryTable>
      <SuccessToast
        open={snackbarOpen}
        onClose={closeSnackbar}
        message="Instance created 🎉"
      />
    </Fragment>
  );
}

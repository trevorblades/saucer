import CreateInstanceButton from '../components/create-instance-button';
import InstancesList from '../components/instances-list';
import Layout from '../components/layout';
import LoginButton from '../components/login-button';
import React from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {useUser} from '../utils';

export default function Index() {
  const {user, logOut} = useUser();
  return (
    <Layout>
      <Box p={4}>
        {user ? (
          <div>
            <Typography>Logged in as {user.name}</Typography>
            <Button onClick={logOut}>Log out</Button>
            <InstancesList />
            <CreateInstanceButton />
          </div>
        ) : (
          <LoginButton />
        )}
      </Box>
    </Layout>
  );
}

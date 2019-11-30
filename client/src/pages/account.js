import Layout from '../components/layout';
import React from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {useUser} from '../utils';

export default function Account() {
  const {logOut} = useUser();
  return (
    <Layout>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4">Account settings</Typography>
        <Button variant="outlined" onClick={logOut}>
          Log out
        </Button>
      </Box>
    </Layout>
  );
}

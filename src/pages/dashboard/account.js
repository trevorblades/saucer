import React, {Fragment} from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {useApolloClient} from '@apollo/client';

export default function Account() {
  const client = useApolloClient();

  function logOut() {
    localStorage.removeItem('token');
    client.resetStore();
  }

  return (
    <Fragment>
      <Helmet>
        <title>Account</title>
      </Helmet>
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
    </Fragment>
  );
}

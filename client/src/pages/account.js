import React from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {useUser} from '../utils';

export default function Account() {
  const {logOut} = useUser();
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Typography variant="h3">Account settings</Typography>
      <Button size="large" variant="outlined" onClick={logOut}>
        Log out
      </Button>
    </Box>
  );
}

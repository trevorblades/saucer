import React, {useContext} from 'react';
import {Box, IconButton, Tooltip, Typography} from '@material-ui/core';
import {FiLogOut} from 'react-icons/fi';
import {UserContext} from '../../utils';

export default function UserStatus() {
  const {user, client} = useContext(UserContext);

  function logOut() {
    localStorage.removeItem('token');
    client.resetStore();
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      mt="auto"
      p={1.5}
      border={1}
      borderColor="divider"
      borderRadius="borderRadius"
    >
      <Box
        component="img"
        src={`https://avatars0.githubusercontent.com/u/${user.id}`}
        borderRadius="50%"
        width={24}
      />
      <Box flexGrow={1} width={0} mx={1.5}>
        <Typography noWrap variant="body2">
          {user.name}
        </Typography>
      </Box>
      <Tooltip title="Log out">
        <IconButton size="small" onClick={logOut}>
          <FiLogOut size={20} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

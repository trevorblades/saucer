import LoginButton from './login-button';
import Logo from './logo';
import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';
import {useUser} from '../utils';

export default function AuthRequired(props) {
  const {user} = useUser();

  if (user) {
    return props.children;
  }

  return (
    <Box height="100vh" display="flex">
      <Box m="auto">
        <Box
          component={Logo}
          width={72}
          height={72}
          mb={4}
          display="block"
          mx="auto"
        />
        <LoginButton />
      </Box>
    </Box>
  );
}

AuthRequired.propTypes = {
  children: PropTypes.node.isRequired
};

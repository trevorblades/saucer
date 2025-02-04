import LoginButton from './login-button';
import Logo from './logo';
import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';
import {UserContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_USER = gql`
  {
    user @client(always: true) {
      id
      name
      email
    }
  }
`;

export default function AuthRequired(props) {
  const {data, client} = useQuery(GET_USER);

  if (data && data.user) {
    return (
      <UserContext.Provider
        value={{
          client,
          user: data.user
        }}
      >
        {props.children}
      </UserContext.Provider>
    );
  }

  return (
    <Box height="100vh" display="flex">
      <Box m="auto" display="flex" flexDirection="column" alignItems="center">
        <Box component={Logo} width={72} height={72} mb={4} />
        <LoginButton />
      </Box>
    </Box>
  );
}

AuthRequired.propTypes = {
  children: PropTypes.node.isRequired
};

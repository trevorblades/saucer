import decode from 'jwt-decode';
import {createContext} from 'react';
import {gql} from '@apollo/client';

export function userFromToken(token) {
  try {
    const user = decode(token);
    return {
      ...user,
      __typename: 'User'
    };
  } catch (error) {
    return null;
  }
}

export const UserContext = createContext();

export const INSTANCE_FRAGMENT = gql`
  fragment InstanceFragment on Instance {
    id
    name
    status
    isReady
    createdAt
  }
`;

export const LIST_INSTANCES = gql`
  {
    instances {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

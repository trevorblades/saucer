import decode from 'jwt-decode';
import {gql, useQuery} from '@apollo/client';
import {graphql, useStaticQuery} from 'gatsby';

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

const GET_USER = gql`
  {
    user @client(always: true) {
      name
      email
    }
  }
`;

export function useUser() {
  const {data, client} = useQuery(GET_USER);
  return {
    user: data && data.user,
    logOut() {
      localStorage.removeItem('token');
      client.resetStore();
    }
  };
}

export const INSTANCE_FRAGMENT = gql`
  fragment InstanceFragment on Instance {
    id
    name
    status
    tags
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

export function useSiteMetadata() {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  );
  return data.site.siteMetadata;
}

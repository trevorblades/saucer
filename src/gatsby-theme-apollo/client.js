import fetch from 'isomorphic-fetch';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache
} from '@apollo/client';
import {userFromToken} from '../utils';

const httpLink = new HttpLink({
  uri: `${
    process.env.NODE_ENV === 'production'
      ? '/.netlify/functions/graphql'
      : 'http://localhost:34567'
  }/graphql`,
  fetch
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return forward(operation);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
  resolvers: {
    Query: {
      user() {
        const token = localStorage.getItem('token');
        return userFromToken(token);
      }
    }
  }
});

export default client;

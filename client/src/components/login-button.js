import GitHubLogin from 'github-login';
import React, {Fragment} from 'react';
import {Button, Typography} from '@material-ui/core';
import {gql, useMutation} from '@apollo/client';
import {userFromToken} from '../utils';

const LOG_IN = gql`
  mutation LogIn($code: String!) {
    logIn(code: $code)
  }
`;

export default function LoginButton() {
  const [logIn, {loading, error}] = useMutation(LOG_IN, {
    update(cache, {data}) {
      localStorage.setItem('token', data.logIn);
      cache.writeData({
        data: {
          user: userFromToken(data.logIn)
        }
      });
    }
  });

  function handleSuccess(variables) {
    logIn({variables});
  }

  return (
    <Fragment>
      {error && <Typography color="error">{error.message}</Typography>}
      <Button
        component={GitHubLogin}
        disabled={loading}
        clientId={process.env.GATSBY_GITHUB_CLIENT_ID}
        onSuccess={handleSuccess}
        // pass an empty string as the redirectUri
        redirectUri=""
      >
        Log in with GitHub
      </Button>
    </Fragment>
  );
}

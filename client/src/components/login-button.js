import GitHubLogin from 'github-login';
import React, {Fragment, useState} from 'react';
import {Button, Typography} from '@material-ui/core';
import {gql, useMutation} from '@apollo/client';

const LOG_IN = gql`
  mutation LogIn($code: String!) {
    logIn(code: $code)
  }
`;

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logIn, mutationState] = useMutation(LOG_IN, {
    onCompleted(data) {
      console.log(data.logIn);
    }
  });

  function handleRequest() {
    setLoading(true);
  }

  function handleSuccess(variables) {
    logIn({variables});
  }

  function handleFailure(error) {
    setError(error);
    setLoading(false);
  }

  const anyError = mutationState.error || error;
  return (
    <Fragment>
      {anyError && <Typography color="error">{anyError.message}</Typography>}
      <Button
        component={GitHubLogin}
        disabled={mutationState.loading || loading}
        clientId={process.env.GATSBY_GITHUB_CLIENT_ID}
        onRequest={handleRequest}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
        // pass an empty string as the redirectUri
        redirectUri=""
      >
        Log in with GitHub
      </Button>
    </Fragment>
  );
}

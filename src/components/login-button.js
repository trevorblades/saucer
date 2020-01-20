import GitHubLogin from 'github-login';
import React, {Fragment, useState} from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {FaGithub} from 'react-icons/fa';
import {useApolloClient} from '@apollo/client';
import {userFromToken} from '../utils';

export default function LoginButton() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSuccess(data) {
    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const token = await response.text();
      localStorage.setItem('token', token);
      client.writeData({
        data: {
          user: userFromToken(token)
        }
      });
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }

  return (
    <Fragment>
      {error && (
        <Typography paragraph color="error">
          {error.message}
        </Typography>
      )}
      <Button
        size="large"
        variant="outlined"
        component={GitHubLogin}
        disabled={loading}
        clientId={
          process.env.NODE_ENV === 'production'
            ? process.env.GATSBY_GITHUB_CLIENT_ID_PROD
            : process.env.GATSBY_GITHUB_CLIENT_ID_DEV
        }
        onSuccess={handleSuccess}
        // pass an empty string as the redirectUri
        redirectUri=""
      >
        <Box component={FaGithub} mr={1.5} size={20} />
        Log in with GitHub
      </Button>
    </Fragment>
  );
}

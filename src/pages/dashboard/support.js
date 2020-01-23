import React, {Fragment, useContext, useState} from 'react';
import {Box, Button, Link, TextField, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {UserContext} from '../../utils';

export default function Support() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {user} = useContext(UserContext);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    const {subject, text} = event.target;
    const response = await fetch('/.netlify/functions/email', {
      method: 'POST',
      body: JSON.stringify({
        text: text.value,
        subject: subject.value,
        from: user.email
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      setSuccess(true);
      return;
    }

    setLoading(false);
  }

  return (
    <Fragment>
      <Helmet>
        <title>Support</title>
      </Helmet>
      <Typography paragraph variant="h4">
        Get support
      </Typography>
      <Typography paragraph variant="h6">
        Send us a message about issues you&apos;re facing or any questions you
        have about the service. You may also email Saucer directly at{' '}
        <Link
          href="mailto:support@saucer.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          support@saucer.dev
        </Link>
        .
      </Typography>
      {success ? (
        <Typography variant="h6">Message sent! 🎉</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            variant="outlined"
            margin="normal"
            label="Subject"
            name="subject"
            placeholder="What is going on?"
          />
          <TextField
            multiline
            required
            fullWidth
            rows={10}
            variant="outlined"
            margin="normal"
            label="More information"
            name="text"
            placeholder="Tell us the details about your problem"
          />
          <Box mt={1} textAlign="right">
            <Button
              disabled={loading}
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              Send message
            </Button>
          </Box>
        </form>
      )}
    </Fragment>
  );
}

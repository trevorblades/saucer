import PropTypes from 'prop-types';
import React from 'react';
import {Box, Button, Typography} from '@material-ui/core';

export default function EmptyState(props) {
  return (
    <Box border={1} borderColor="divider" p={4} mt={3} textAlign="center">
      <img height={250} src={props.image} />
      <Box mt={2} mb={3}>
        <Typography variant="h5" gutterBottom>
          {props.title}
        </Typography>
        <Typography>{props.subtitle}</Typography>
      </Box>
      <Button
        onClick={props.onButtonClick}
        size="large"
        color="primary"
        variant="contained"
      >
        {props.buttonText}
      </Button>
    </Box>
  );
}

EmptyState.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired
};

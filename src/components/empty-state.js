import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';

export default function EmptyState(props) {
  return (
    <Box border={1} borderColor="divider" p={4} mt={3} textAlign="center">
      <Box component="img" mb={2} height={250} src={props.image} />
      {props.children}
    </Box>
  );
}

EmptyState.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

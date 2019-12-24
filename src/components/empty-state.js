import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@material-ui/core';

export function EmptyStateWrapper(props) {
  return (
    <Box
      border={1}
      borderColor="divider"
      p={4}
      my={3}
      textAlign="center"
      {...props}
    />
  );
}

export default function EmptyState(props) {
  return (
    <EmptyStateWrapper>
      <Box component="img" mb={2} height={250} src={props.image} />
      {props.children}
    </EmptyStateWrapper>
  );
}

EmptyState.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

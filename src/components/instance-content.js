import EmptyState from './empty-state';
import PropTypes from 'prop-types';
import React from 'react';
import waiting from '../assets/waiting.png';
import {Box, LinearProgress, Link, Typography} from '@material-ui/core';
import {FiArrowUpRight} from 'react-icons/fi';

export default function InstanceContent(props) {
  switch (props.instance.status) {
    case 'Pending':
    case 'Delayed':
    case 'InProgress':
      return (
        <EmptyState image={waiting}>
          <Box mb={3}>
            <Box width={1 / 2} mx="auto" mb={2}>
              <LinearProgress />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Warming up your Wordpress 🔥
            </Typography>
          </Box>
        </EmptyState>
      );
    case 'Success':
      return (
        <Link
          variant="h6"
          href={`https://${props.instance.name}.saucer.dev/wp-admin`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Wordpress admin
          <Box
            component={FiArrowUpRight}
            ml={0.5}
            size="1em"
            style={{verticalAlign: -1}}
          />
        </Link>
      );
    default:
      return null;
  }
}

InstanceContent.propTypes = {
  instance: PropTypes.object.isRequired
};

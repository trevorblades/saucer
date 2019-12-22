import EmptyState from './empty-state';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import waiting from '../assets/waiting.png';
import {
  Box,
  CardActionArea,
  LinearProgress,
  Link,
  Typography
} from '@material-ui/core';
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
        <Fragment>
          <Box my={3} border={1} borderColor="divider" p={2} textAlign="center">
            <Typography variant="subtitle1">
              Wordpress is running at{' '}
              <Link
                href={`https://${props.instance.name}.saucer.dev/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${props.instance.name}.saucer.dev`}
                <Box
                  component={FiArrowUpRight}
                  ml={0.5}
                  size="1em"
                  style={{verticalAlign: -1}}
                />
              </Link>
            </Typography>
          </Box>
          <Box display="flex">
            <Box bgcolor="blueviolet" color="white">
              <CardActionArea>
                <Box p={4}>
                  <Typography variant="subtitle1">Guide</Typography>
                  <Typography variant="h5">
                    Create a static site with Gatsby
                  </Typography>
                </Box>
              </CardActionArea>
            </Box>
          </Box>
        </Fragment>
      );
    default:
      return null;
  }
}

InstanceContent.propTypes = {
  instance: PropTypes.object.isRequired
};

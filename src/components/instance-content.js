import EmptyState, {EmptyStateWrapper} from './empty-state';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import waiting from '../assets/waiting.png';
import {
  Box,
  Button,
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
          <EmptyStateWrapper p={2}>
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
          </EmptyStateWrapper>
          <Box mb={3}>
            <CardActionArea>
              <Box
                p={3}
                border={2}
                color="#663399"
                height={200}
                display="flex"
                alignItems="flex-end"
              >
                <Typography variant="h5">
                  Create a static Wordpress site with Gatsby
                </Typography>
              </Box>
            </CardActionArea>
          </Box>
          <Box mb={3}>
            <Typography gutterBottom variant="h5">
              Next steps
            </Typography>
            <Typography variant="subtitle1">
              Trigger Netlify deploys on every content publish
            </Typography>
            <Typography variant="subtitle1">
              Send data to Wordpress using GraphQL
            </Typography>
            <Typography variant="subtitle1">
              Configure a custom domain
            </Typography>
          </Box>
          <Typography gutterBottom variant="h5">
            Danger zone
          </Typography>
          <Box color="error.main">
            <Button variant="outlined" color="inherit">
              Delete instance
            </Button>
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

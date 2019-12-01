import InstanceActions from './instance-actions';
import InstanceStatus from './instance-status';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import mirageListIsEmpty from '../../assets/mirage-list-is-empty.png';
import {
  Box,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@material-ui/core';
import {FaWordpressSimple} from 'react-icons/fa';
import {formatDistanceToNow} from 'date-fns';

export default function InstancesTable(props) {
  if (props.loading || props.error) {
    return (
      <Typography variant="h6" color={props.error ? 'error' : 'textSecondary'}>
        {props.error ? props.error.message : 'Loading...'}
      </Typography>
    );
  }

  if (!props.data.instances.length) {
    return (
      <Box border={1} borderColor="divider" p={4} mt={3} textAlign="center">
        <img height={200} src={mirageListIsEmpty} />
        <Box mt={2} mb={3}>
          <Typography variant="h5" gutterBottom>
            You have no instances
          </Typography>
          <Typography>Luckily, it&apos;s really easy to create one!</Typography>
        </Box>
        <Button
          onClick={props.onCreateInstance}
          size="large"
          color="primary"
          variant="contained"
        >
          Create instance
        </Button>
      </Box>
    );
  }

  return (
    <Fragment>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="none">Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell colSpan={2}>Created </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.instances.map(instance => {
            const createdAt = new Date(instance.createdAt);
            return (
              <TableRow key={instance.id}>
                <TableCell padding="none">
                  <Box display="flex" alignItems="center">
                    <Box mr={2} component={FaWordpressSimple} size={24} />
                    {instance.status === 'active' &&
                    instance.tags.includes('ready') ? (
                      <Link
                        href={`https://${instance.name}.saucer.dev/wp-admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {instance.name}
                      </Link>
                    ) : (
                      instance.name
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <InstanceStatus instance={instance} />
                </TableCell>
                <TableCell>
                  <Tooltip title={createdAt.toLocaleString()}>
                    <span>
                      {formatDistanceToNow(createdAt, {
                        addSuffix: true
                      })}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" padding="checkbox">
                  <InstanceActions instance={instance} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Fragment>
  );
}

InstancesTable.propTypes = {
  data: PropTypes.object,
  onCreateInstance: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object
};

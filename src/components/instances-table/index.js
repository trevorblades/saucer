import EmptyState from '../empty-state';
import InstanceActions from './instance-actions';
import InstanceIcon from './instance-icon';
import InstanceStatus from './instance-status';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import egg from '../../assets/egg.png';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@material-ui/core';
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
      <EmptyState
        image={egg}
        title="You have no instances"
        subtitle="Luckily, it's really easy to create one!"
        buttonText="Create instance"
        onButtonClick={props.onCreateInstance}
      />
    );
  }

  return (
    <Fragment>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="none">Name</TableCell>
            <TableCell padding="none">Status</TableCell>
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
                    <InstanceIcon name={instance.name} />
                    <Link
                      color="inherit"
                      href={`https://${instance.name}.saucer.dev/wp-admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={
                        instance.status !== 'running' || !instance.isReady
                      }
                    >
                      {instance.name}
                    </Link>
                  </Box>
                </TableCell>
                <TableCell padding="none">
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

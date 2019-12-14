import InstanceActions from './instance-actions';
import InstanceIcon from './instance-icon';
import InstanceStatus from './instance-status';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@material-ui/core';
import {formatDistanceToNow} from 'date-fns';

export default function InstancesTable(props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="none">Name</TableCell>
          <TableCell padding="none">Status</TableCell>
          <TableCell colSpan={2}>Created</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.instances.map(instance => {
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
  );
}

InstancesTable.propTypes = {
  instances: PropTypes.array.isRequired
};

import InstanceActions from './instance-actions';
import InstanceIcon from '../instance-icon';
import InstanceStatus from './instance-status';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@material-ui/core';
import {Link} from 'gatsby-theme-material-ui';
import {formatDistanceToNow} from 'date-fns';

export default function InstancesTable(props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="none">Name</TableCell>
          <TableCell padding="none">Status</TableCell>
          <TableCell colSpan={2}>Last updated</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.instances.map(instance => {
          const updatedAt = new Date(instance.updatedAt);
          return (
            <TableRow key={instance.id}>
              <TableCell padding="none">
                <Box display="flex" alignItems="center">
                  <InstanceIcon name={instance.name} fontSize={20} mr={2} />
                  <Link
                    color="inherit"
                    to={`/dashboard/instances/${instance.id}`}
                  >
                    {instance.name}
                  </Link>
                </Box>
              </TableCell>
              <TableCell padding="none">
                <InstanceStatus instance={instance} />
              </TableCell>
              <TableCell>
                <Tooltip title={updatedAt.toLocaleString()}>
                  <span>
                    {formatDistanceToNow(updatedAt, {addSuffix: true})}
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

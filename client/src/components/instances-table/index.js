import InstanceActions from './instance-actions';
import InstanceStatus from './instance-status';
import React, {Fragment} from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@material-ui/core';
import {FaWordpressSimple} from 'react-icons/fa';
import {LIST_INSTANCES} from '../../utils';
import {formatDistanceToNow} from 'date-fns';
import {useQuery} from '@apollo/client';

export default function InstancesTable() {
  const {data, loading, error} = useQuery(LIST_INSTANCES);

  if (loading || error) {
    return (
      <Typography variant="h6" color={error ? 'error' : 'textSecondary'}>
        {error ? error.message : 'Loading...'}
      </Typography>
    );
  }

  if (!data.instances.length) {
    return <Typography variant="h6">You have no instances</Typography>;
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
          {data.instances.map(instance => {
            const createdAt = new Date(instance.createdAt);
            return (
              <TableRow key={instance.id}>
                <TableCell padding="none">
                  <Box display="flex" alignItems="center">
                    <Box mr={2} component={FaWordpressSimple} size={20} />
                    {instance.name}
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
                <TableCell align="right">
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

import CreateInstanceButton from '../create-instance-button';
import InstanceActions from './instance-actions';
import InstanceStatus from './instance-status';
import React, {Fragment} from 'react';
import mirageListIsEmpty from '../../assets/mirage-list-is-empty.png';
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
    return (
      <Box border={1} borderColor="divider" p={4} mt={3} textAlign="center">
        <img height={200} src={mirageListIsEmpty} />
        <Box mt={2} mb={3}>
          <Typography variant="h5" gutterBottom>
            You have no instances
          </Typography>
          <Typography>Luckily, it&apos;s really easy to create one!</Typography>
        </Box>
        <CreateInstanceButton
          size="large"
          color="primary"
          variant="contained"
        />
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
          {data.instances.map(instance => {
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

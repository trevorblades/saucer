import InstanceIcon from '../../components/instance-icon';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Box, Link, Typography} from '@material-ui/core';
import {FiArrowUpRight} from 'react-icons/fi';
import {Helmet} from 'react-helmet';
import {INSTANCE_FRAGMENT} from '../../utils';
import {gql, useQuery} from '@apollo/client';

const GET_INSTANCE = gql`
  query GetInstance($id: ID!) {
    instance(id: $id) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function Instances(props) {
  const {data, loading, error} = useQuery(GET_INSTANCE, {
    variables: {
      id: props['*']
    }
  });

  if (loading) {
    return <Typography variant="h4">Loading...</Typography>;
  }

  if (error) {
    return (
      <Box color="error.main">
        <Typography paragraph variant="h4">
          Error
        </Typography>
        <Typography variant="h6">{error.message}</Typography>
      </Box>
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>{data.instance.name}</title>
      </Helmet>
      <Box mb={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <InstanceIcon name={data.instance.name} fontSize={24} mr={2} />
          <Typography variant="h4">{data.instance.name}</Typography>
        </Box>
        <Link
          variant="h6"
          href={`https://${data.instance.name}.saucer.dev/wp-admin`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Wordpress admin
          <Box
            component={FiArrowUpRight}
            ml={0.5}
            size={24}
            style={{verticalAlign: -1}}
          />
        </Link>
      </Box>
    </Fragment>
  );
}

Instances.propTypes = {
  '*': PropTypes.string.isRequired
};

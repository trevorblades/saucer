import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {INSTANCE_FRAGMENT} from '../../utils';
import {Typography} from '@material-ui/core';
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Fragment>
      <Typography variant="h4">{data.instance.name}</Typography>
    </Fragment>
  );
}

Instances.propTypes = {
  '*': PropTypes.string.isRequired
};

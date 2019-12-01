import React from 'react';
import {Button} from '@material-ui/core';
import {INSTANCE_FRAGMENT, LIST_INSTANCES} from '../utils';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {gql, useMutation} from '@apollo/client';

const CREATE_INSTANCE = gql`
  mutation CreateInstance($name: String!) {
    createInstance(name: $name) {
      ...InstanceFragment
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export default function CreateInstanceButton(props) {
  const [createInstance, {loading}] = useMutation(CREATE_INSTANCE, {
    update(cache, {data}) {
      const {instances} = cache.readQuery({
        query: LIST_INSTANCES
      });

      cache.writeQuery({
        query: LIST_INSTANCES,
        data: {
          instances: [...instances, data.createInstance]
        }
      });
    }
  });

  function handleClick() {
    const name = uniqueNamesGenerator({
      dictionaries: [colors, adjectives, animals],
      separator: '-'
    });

    createInstance({
      variables: {name}
    });
  }

  return (
    <Button disabled={loading} onClick={handleClick} {...props}>
      Create instance
    </Button>
  );
}

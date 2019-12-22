import PropTypes from 'prop-types';
import React from 'react';

export default function Instances(props) {
  const id = props['*'];
  if (!id) {
    return <div>Not found</div>;
  }

  return <div>{id}</div>;
}

Instances.propTypes = {
  '*': PropTypes.string.isRequired
};

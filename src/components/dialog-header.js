import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Box, Typography} from '@material-ui/core';

export default function DialogHeader(props) {
  return (
    <Fragment>
      <Box
        component="img"
        display="block"
        mx="auto"
        src={props.image}
        height={200}
      />
      <Typography paragraph align="center" variant="h5">
        {props.children}
      </Typography>
    </Fragment>
  );
}

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
  image: PropTypes.string.isRequired
};

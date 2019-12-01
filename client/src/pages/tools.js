import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Typography} from '@material-ui/core';

export default function Tools() {
  return (
    <Fragment>
      <Helmet>
        <title>Tools</title>
      </Helmet>
      <Typography variant="h3">Free tools</Typography>
    </Fragment>
  );
}

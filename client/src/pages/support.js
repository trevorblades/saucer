import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Typography} from '@material-ui/core';

export default function Support() {
  return (
    <Fragment>
      <Helmet>
        <title>Support</title>
      </Helmet>
      <Typography variant="h3">Support center</Typography>
    </Fragment>
  );
}

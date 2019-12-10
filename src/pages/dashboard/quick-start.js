import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Typography} from '@material-ui/core';

export default function QuickStart() {
  return (
    <Fragment>
      <Helmet>
        <title>Quick start</title>
      </Helmet>
      <Typography variant="h4">Quick start</Typography>
    </Fragment>
  );
}

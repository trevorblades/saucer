import Logo from './logo';
import React from 'react';
import {Box} from '@material-ui/core';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {ReactComponent as Wordmark} from '../assets/wordmark.svg';

export default function LogoTitle(props) {
  return (
    <Box {...LogoTitleProps.root} color="text.primary" {...props}>
      <Logo width="1em" fill="currentColor" />
      <Box
        component={Wordmark}
        height="calc(7em / 18)"
        ml="calc(1em / 3)"
        fill="currentColor"
      />
    </Box>
  );
}

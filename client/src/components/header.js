import React from 'react';
import {Box, Button} from '@material-ui/core';
import {ReactComponent as Logo} from 'twemoji/2/svg/1f375.svg';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {useSiteMetadata, useUser} from '../utils';

export default function Header() {
  const {title} = useSiteMetadata();
  const {logOut} = useUser();
  return (
    <Box
      px={3}
      height={64}
      bgcolor="background.paper"
      display="flex"
      alignItems="center"
    >
      <Box {...LogoTitleProps.root} mr="auto">
        <Box {...LogoTitleProps.logo} component={Logo} />
        <Box {...LogoTitleProps.title}>{title}</Box>
      </Box>
      <Button variant="outlined" onClick={logOut}>
        Log out
      </Button>
    </Box>
  );
}

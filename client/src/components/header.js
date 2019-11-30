import CreateInstanceButton from './create-instance-button';
import Logo from './logo';
import React from 'react';
import {Box, Button} from '@material-ui/core';
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
      <CreateInstanceButton />
      <Box ml={1.5}>
        <Button variant="outlined" onClick={logOut}>
          Log out
        </Button>
      </Box>
    </Box>
  );
}

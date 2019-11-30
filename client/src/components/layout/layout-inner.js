import Logo from '../logo';
import PropTypes from 'prop-types';
import React from 'react';
import {Box, List, ListItem, ListItemText, useTheme} from '@material-ui/core';
import {Link} from 'gatsby';
import {LogoTitleProps} from '@trevorblades/mui-theme';

const navItems = {
  '/': 'Instances',
  '/tools': 'Tools',
  '/billing': 'Billing',
  '/support': 'Support',
  '/account': 'Account'
};

export default function LayoutInner(props) {
  const {breakpoints, shape} = useTheme();
  return (
    <Box
      minHeight="100vh"
      display="flex"
      bgcolor="background.paper"
      mx="auto"
      maxWidth={breakpoints.values.lg}
    >
      <Box p={1} width={300} height="100vh" position="sticky" flexShrink={0}>
        <Box {...LogoTitleProps.root} p={2}>
          <Box {...LogoTitleProps.logo} component={Logo} />
          <Box {...LogoTitleProps.title}>{props.title}</Box>
        </Box>
        <List component="nav">
          {Object.entries(navItems).map(([path, label]) => (
            <ListItem
              button
              component={Link}
              key={path}
              to={path}
              style={{borderRadius: shape.borderRadius}}
            >
              <ListItemText>{label}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box flexGrow={1} p={4} borderLeft={1} borderColor="divider" {...props} />
    </Box>
  );
}

LayoutInner.propTypes = {
  title: PropTypes.string.isRequired
};

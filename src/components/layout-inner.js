import Logo from './logo';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Typography,
  useTheme
} from '@material-ui/core';
import {Link} from 'gatsby';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {ReactComponent as Wordmark} from '../assets/wordmark.svg';

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
      <Box
        p={1}
        width={250}
        height="100vh"
        position="sticky"
        top={0}
        flexShrink={0}
        style={{overflow: 'auto'}}
      >
        <Box {...LogoTitleProps.root} p={2}>
          <Logo width="1em" fill="currentColor" />
          <Box
            component={Wordmark}
            height="calc(7em / 18)"
            ml="calc(1em / 3)"
            fill="currentColor"
          />
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
              <ListItemText
                primaryTypographyProps={{
                  color:
                    path === props.pathname ? 'textPrimary' : 'textSecondary'
                }}
              >
                {label}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        borderLeft={1}
        borderColor="divider"
      >
        <Box p={4}>{props.children}</Box>
        <Box component="footer" mt="auto" py={2} mx={4}>
          <Typography variant="caption" color="textSecondary">
            &copy; {new Date().getFullYear()} Saucer. Illustrations by{' '}
            <MuiLink
              color="inherit"
              href="https://icons8.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouch.pics
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

LayoutInner.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  pathname: PropTypes.string.isRequired
};

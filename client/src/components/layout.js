import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Box, NoSsr} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {ReactComponent as Logo} from 'twemoji/2/svg/1f6f8.svg';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {graphql, useStaticQuery} from 'gatsby';

export default function Layout(props) {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  );

  const {title, description} = data.site.siteMetadata;
  return (
    <Fragment>
      <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`}>
        <meta name="description" content={description} />
      </Helmet>
      <Box
        px={3}
        height={64}
        bgcolor="background.paper"
        display="flex"
        alignItems="center"
      >
        <Box {...LogoTitleProps.root}>
          <Box {...LogoTitleProps.logo} component={Logo} />
          <Box {...LogoTitleProps.title}>{title}</Box>
        </Box>
      </Box>

      <NoSsr>{props.children}</NoSsr>
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

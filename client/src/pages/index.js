import React, {Fragment} from 'react';
import {Box} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {ReactComponent as Logo} from 'twemoji/2/svg/1f6f8.svg';
import {LogoTitleProps} from '@trevorblades/mui-theme';
import {graphql, useStaticQuery} from 'gatsby';

export default function Index() {
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
      <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`} />
      <Helmet>
        <title>{description}</title>
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
    </Fragment>
  );
}

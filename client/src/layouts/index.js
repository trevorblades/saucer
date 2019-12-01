import AuthRequired from '../components/auth-required';
import LayoutInner from '../components/layout-inner';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {NoSsr} from '@material-ui/core';
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
        {/* prevent the app from being indexed */}
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* prevent SSR on all pages */}
      <NoSsr>
        <AuthRequired>
          <LayoutInner title={title} pathname={props.location.pathname}>
            {props.children}
          </LayoutInner>
        </AuthRequired>
      </NoSsr>
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired
};

import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {NoSsr} from '@material-ui/core';
import {useSiteMetadata} from '../utils';

export default function Layout(props) {
  const {title, description} = useSiteMetadata();
  return (
    <Fragment>
      <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`}>
        <meta name="description" content={description} />
      </Helmet>
      {/* prevent SSR on all pages */}
      <NoSsr>{props.children}</NoSsr>
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

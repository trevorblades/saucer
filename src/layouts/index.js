import BasicLayout from '../components/basic-layout';
import DashboardLayout from '../components/dashboard-layout';
import PropTypes from 'prop-types';
import React from 'react';

export default function Layout(props) {
  if (props.pageContext.layout === 'dashboard') {
    return (
      <DashboardLayout pathname={props.location.pathname}>
        {props.children}
      </DashboardLayout>
    );
  }

  return <BasicLayout>{props.children}</BasicLayout>;
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired
};

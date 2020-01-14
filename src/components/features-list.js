import React from 'react';
import {Typography} from '@material-ui/core';
import {graphql, useStaticQuery} from 'gatsby';
import {locales} from '../utils';

function ListItem(props) {
  return <Typography gutterBottom component="li" variant="h6" {...props} />;
}

export default function FeaturesList() {
  const {wordpressVersion} = useStaticQuery(graphql`
    {
      wordpressVersion(response: {eq: "upgrade"}) {
        version
      }
    }
  `);

  return (
    <ul>
      <ListItem>
        Latest version of Wordpress (v{wordpressVersion.version})
      </ListItem>
      <ListItem>Automatic Wordpress updates</ListItem>
      <ListItem>Ready-to-use GraphQL API</ListItem>
      <ListItem>Data served over HTTPS</ListItem>
      <ListItem>Trigger Netlify deploys when content changes</ListItem>
      <ListItem>Affordable per-instance pricing</ListItem>
      <ListItem>{Object.keys(locales).length} languages supported</ListItem>
    </ul>
  );
}

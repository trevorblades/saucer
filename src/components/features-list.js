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
      <ListItem>Ready-to-use GraphQL API</ListItem>
      <ListItem>Netlify build hook support</ListItem>
      <ListItem>Free SSL certificate</ListItem>
      <ListItem>Unlimited Wordpress users</ListItem>
      <ListItem>Pay-per-instance</ListItem>
      <ListItem>{Object.keys(locales).length} languages supported</ListItem>
    </ul>
  );
}

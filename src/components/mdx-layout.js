import CenteredBox from './centered-box';
import PageLayout from './page-layout';
import PropTypes from 'prop-types';
import React from 'react';
import {Box, Typography} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {Link} from 'gatsby-theme-material-ui';
import {MDXProvider} from '@mdx-js/react';

const components = {
  h1(props) {
    return <Typography gutterBottom variant="h3" {...props} />;
  },
  h2(props) {
    return <Typography gutterBottom variant="h4" {...props} />;
  },
  h3(props) {
    return <Typography gutterBottom variant="h5" {...props} />;
  },
  h4(props) {
    return <Typography gutterBottom variant="h6" {...props} />;
  },
  h5(props) {
    return <Typography gutterBottom variant="subtitle1" {...props} />;
  },
  h6(props) {
    return <Typography gutterBottom variant="subtitle2" {...props} />;
  },
  p(props) {
    return <Typography paragraph {...props} />;
  },
  a: Link
};

export default function MDXLayout(props) {
  const {frontmatter} = props.pageContext;
  return (
    <PageLayout>
      <Helmet>
        <title>{frontmatter.title}</title>
      </Helmet>
      <CenteredBox px={8} py={12}>
        <Box width={1 / 2}>
          <Typography gutterBottom variant="h2">
            {frontmatter.title}
          </Typography>
          <Typography paragraph variant="h6">
            {frontmatter.description}
          </Typography>
        </Box>
      </CenteredBox>
      <CenteredBox px={8} py={10}>
        <MDXProvider components={components}>{props.children}</MDXProvider>
      </CenteredBox>
    </PageLayout>
  );
}

MDXLayout.propTypes = {
  children: PropTypes.node.isRequired,
  pageContext: PropTypes.object.isRequired
};

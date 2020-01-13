import '../prismjs.css';
import 'prismjs/plugins/command-line/prism-command-line.css';
import 'prismjs/themes/prism-tomorrow.css';
import CenteredBox from './centered-box';
import PageLayout, {HEADER_HEIGHT} from './page-layout';
import PropTypes from 'prop-types';
import React from 'react';
import build from '../assets/build.png';
import {Box, Typography, makeStyles} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {Link} from 'gatsby-theme-material-ui';
import {MDXProvider} from '@mdx-js/react';

const useStyles = makeStyles(theme => ({
  heading: {
    '&:not(:first-child)': {
      marginTop: theme.spacing(5)
    },
    '&::before': {
      content: "''",
      display: 'block',
      height: HEADER_HEIGHT,
      marginTop: -HEADER_HEIGHT
    }
  }
}));

function Heading(props) {
  const {heading} = useStyles();
  return <Typography gutterBottom className={heading} {...props} />;
}

const components = {
  h1(props) {
    return <Heading variant="h3" {...props} />;
  },
  h2(props) {
    return <Heading variant="h4" {...props} />;
  },
  h3(props) {
    return <Heading variant="h5" {...props} />;
  },
  h4(props) {
    return <Heading variant="h6" {...props} />;
  },
  h5(props) {
    return <Heading variant="subtitle1" {...props} />;
  },
  h6(props) {
    return <Heading variant="subtitle2" {...props} />;
  },
  p(props) {
    return <Typography paragraph {...props} />;
  },
  li(props) {
    return <Typography gutterBottom component="li" {...props} />;
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
      <div
        style={{
          backgroundImage: `url(${build})`,
          backgroundSize: 550,
          backgroundPosition: '50vw center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <CenteredBox px={8} py={12}>
          <Box
            width={{
              xs: 1,
              md: 1 / 2
            }}
          >
            <Typography gutterBottom variant="h2">
              {frontmatter.title}
            </Typography>
            <Typography paragraph variant="h6">
              {frontmatter.description}
            </Typography>
          </Box>
        </CenteredBox>
      </div>
      <CenteredBox px={8} py={10} display="flex" alignItems="flex-start">
        <Box width={0} flexGrow={1}>
          <MDXProvider components={components}>{props.children}</MDXProvider>
        </Box>
        <Box
          width={300}
          flexShrink={0}
          ml={5}
          position="sticky"
          top={HEADER_HEIGHT + 24}
          display={{
            xs: 'none',
            md: 'block'
          }}
        >
          <Typography gutterBottom variant="overline" display="block">
            In this article
          </Typography>
          {props.children
            .filter(child => 'id' in child.props)
            .map(heading => {
              const {id, children} = heading.props;
              return (
                <Typography gutterBottom variant="subtitle1" key={id}>
                  <Link color="inherit" href={`#${id}`}>
                    {children}
                  </Link>
                </Typography>
              );
            })}
        </Box>
      </CenteredBox>
    </PageLayout>
  );
}

MDXLayout.propTypes = {
  children: PropTypes.node.isRequired,
  pageContext: PropTypes.object.isRequired
};

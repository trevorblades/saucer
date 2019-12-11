const {webFontsConfig} = require('@trevorblades/mui-theme');

module.exports = {
  siteMetadata: {
    title: 'Saucer',
    description: 'Headless Wordpress + GraphQL on demand'
  },
  plugins: [
    {
      resolve: 'gatsby-theme-material-ui',
      options: {webFontsConfig}
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-svgr',
    'gatsby-theme-apollo',
    'gatsby-plugin-layout',
    'gatsby-plugin-svgr',
    {
      resolve: 'gatsby-plugin-stripe',
      options: {
        async: true
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/assets/favicon.svg'
      }
    },
    {
      resolve: 'gatsby-source-apiserver',
      options: {
        name: 'wordpressVersion',
        entityLevel: 'offers',
        url: 'https://api.wordpress.org/core/version-check/1.7'
      }
    }
  ]
};

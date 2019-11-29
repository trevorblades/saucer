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
    {
      resolve: 'gatsby-plugin-emoji-favicon',
      options: {
        emoji: '🍵'
      }
    }
  ]
};

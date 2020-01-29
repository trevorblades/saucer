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
    {
      resolve: 'gatsby-plugin-create-client-paths',
      options: {
        prefixes: ['/dashboard/instances/*']
      }
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-svgr',
    'gatsby-theme-apollo',
    'gatsby-plugin-layout',
    'gatsby-plugin-svgr',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              icon: false
            }
          },
          'gatsby-remark-prismjs'
        ],
        defaultLayouts: {
          default: require.resolve('./src/components/mdx-layout.js')
        }
      }
    },
    {
      resolve: 'gatsby-source-stripe',
      options: {
        objects: ['Product', 'Plan'],
        secretKey:
          process.env.NODE_ENV === 'production'
            ? process.env.STRIPE_SECRET_KEY_PROD
            : process.env.STRIPE_SECRET_KEY_DEV
      }
    },
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

const {AuthenticationError, UserInputError} = require('apollo-server-lambda');
const {
  adjectives,
  animals,
  uniqueNamesGenerator
} = require('unique-names-generator');
const {query} = require('faunadb');
const {generate} = require('randomstring');
const {outdent} = require('outdent');
const {paginateInstancesForUser} = require('../utils');

module.exports = async function createInstance(
  parent,
  args,
  {user, ssm, stripe, client}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  let subscription;
  if (!args.source) {
    // if no payment is provided, check to see if the user can start a trial
    const {data} = await client.query(paginateInstancesForUser(user));
    if (data.length) {
      throw new UserInputError(
        'Free trial limit reached. Please provide a payment method.'
      );
    }
  } else {
    // process payment before proceeding
    subscription = await stripe.subscriptions.create({
      customer: user.data.customer_id,
      default_source: args.source,
      items: [{plan: process.env.STRIPE_PLAN_ID_DEV}]
    });
  }

  // generate a subdomain: part english words, part hex color code
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    length: 2,
    separator: '-'
  });

  const hex = generate({
    length: 6,
    charset: 'hex',
    capitalization: 'lowercase'
  });

  const subdomain = `${name}-${hex}`;

  // default plugins
  const plugins = [
    'wp-fail2ban',
    {
      name: 'wp-graphql',
      url: 'https://github.com/wp-graphql/wp-graphql'
    },
    {
      name: 'wp-graphiql',
      url: 'https://github.com/wp-graphql/wp-graphiql'
    },
    {
      name: 'gatsby-toolkit',
      url: 'https://github.com/staticfuse/gatsby-toolkit'
    }
  ];

  // conditionally add optional plugins and their graphql counterparts
  if (args.plugins.acf) {
    plugins.push('advanced-custom-fields', {
      name: 'wp-graphql-acf',
      url: 'https://github.com/wp-graphql/wp-graphql-acf'
    });
  }

  if (args.plugins.woocommerce) {
    plugins.push('woocommerce', {
      name: 'wp-graphql-woocommerce',
      url: 'https://github.com/wp-graphql/wp-graphql-woocommerce'
    });
  }

  if (args.plugins.polylang) {
    plugins.push('polylang', {
      name: 'wp-graphql-polylang',
      url: 'https://github.com/valu-digital/wp-graphql-polylang'
    });
  }

  // separate the plugins that can be installed with the wp CLI
  // and the ones that need to be installed using git
  const {wp, gh} = plugins.reduce(
    (acc, plugin) => {
      const key = typeof plugin === 'string' ? 'wp' : 'gh';
      return {
        ...acc,
        [key]: [...acc[key], plugin]
      };
    },
    {wp: [], gh: []}
  );

  const {Command} = await ssm
    .sendCommand({
      InstanceIds: [process.env.AWS_EC2_INSTANCE_ID],
      DocumentName: 'AWS-RunShellScript',
      Parameters: {
        commands: [
          `subdomain=${subdomain}`,
          `dbname=${subdomain.replace(/-/g, '_')}`,
          `dbpass=${generate()}`,
          // create db and user and grant privileges
          outdent`
            mysql -u root << EOF
            CREATE DATABASE $dbname;
            GRANT ALL PRIVILEGES ON $dbname.* TO $dbname@'localhost' IDENTIFIED BY '$dbpass';
            FLUSH PRIVILEGES;
            EOF
          `,
          // create and move into subdomain directory
          'cd /var/www/html',
          'mkdir $subdomain',
          'cd $subdomain',
          // download and install wordpress
          `wp core download --locale=${args.locale}`,
          outdent`
            wp config create \
              --dbname=$dbname \
              --dbuser=$dbname \
              --dbpass=$dbpass
          `,
          outdent`
            wp core install \
              --url=https://$subdomain.saucer.dev \
              --title=${args.title} \
              --admin_user=${args.adminUser} \
              --admin_password=${args.adminPassword} \
              --admin_email=${args.adminEmail}
          `,
          // allow wp to write to .htaccess and set up pretty permalinks
          outdent`
            cat >> wp-cli.yml << EOF
            apache_modules:
              - mod_rewrite
            EOF
          `,
          'touch .htaccess',
          "wp rewrite structure --hard '/%year%/%monthnum%/%postname%/'",
          // allow wp to install plugins and updates
          "echo \"define( 'FS_METHOD', 'direct' );\" >> wp-config.php",
          'chown -R apache:apache /var/www/html/$subdomain/*',
          // install plugins
          'cd wp-content/plugins',
          `wp plugin install ${wp.join(' ')}`,
          ...gh.map(plugin => `git clone ${plugin.url}`),
          `wp plugin activate ${plugins
            .map(plugin => (typeof plugin === 'string' ? plugin : plugin.name))
            .join(' ')}`
        ]
      }
    })
    .promise();

  const instance = await client.query(
    query.Create(query.Collection('wp_instances'), {
      data: {
        name: subdomain,
        user_id: user.data.id,
        command_id: Command.CommandId
      }
    })
  );

  if (subscription) {
    // update the subscription with metadata about the instance
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        instance_id: instance.ref.id
      }
    });
  }

  return instance;
};

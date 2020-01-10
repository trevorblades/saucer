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

const PAYMENT_METHOD_ERROR =
  'You selected a paid plan. Add a valid payment method in your billing settings to create this instance.';

module.exports = async function createInstance(
  parent,
  args,
  {user, ssm, stripe, client}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  let subscriptionItem;
  if (!args.plan) {
    // if no payment was provided, check to see if the user can start a trial
    const instances = await client.query(paginateInstancesForUser(user));
    if (instances.data.length) {
      throw new UserInputError(
        'Free instance limit reached. Please select a payment option.'
      );
    }
  } else {
    // if the user doesn't have a customer id, they need to add a card
    if (!user.data.customer_id) {
      throw new UserInputError(PAYMENT_METHOD_ERROR);
    }

    // if they have no cards, they need to create one
    const sources = await stripe.customers.listSources(user.data.customer_id);
    if (!sources.data.length) {
      throw new UserInputError(PAYMENT_METHOD_ERROR);
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.data.customer_id
    });

    subscriptionItem = subscriptions.data
      .flatMap(subscription => subscription.items.data)
      .find(item => item.plan.id === args.plan);

    if (subscriptionItem) {
      // if a sub item exists for this plan, increment the quantity
      await stripe.subscriptionItems.update(subscriptionItem.id, {
        quantity: subscriptionItem.quantity + 1
      });
    } else {
      // otherwise create a new subscription with a quantity of 1
      const subscription = await stripe.subscriptions.create({
        customer: user.data.customer_id,
        items: [
          {
            plan: args.plan,
            quantity: 1
          }
        ]
      });

      subscriptionItem = subscription.items.data[0];
    }
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
          // inspired by https://serverfault.com/a/853191
          outdent`
            cat >> .htaccess << EOF
            # redirect all requests for non-existent files and those not for headless use
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteCond %{REQUEST_URI} !^/wp-admin
            RewriteCond %{REQUEST_URI} !^/wp-json
            RewriteCond %{REQUEST_URI} !^/graphql
            RewriteRule ^ /wp-admin [R=301,L]
            EOF
          `,
          "wp rewrite structure --hard '/%year%/%monthnum%/%postname%/'",
          // install plugins
          'cd wp-content/plugins',
          `wp plugin install ${wp.join(' ')}`,
          ...gh.map(plugin => `git clone ${plugin.url}`),
          `wp plugin activate ${plugins
            .map(plugin => (typeof plugin === 'string' ? plugin : plugin.name))
            .join(' ')}`,
          // allow wp to write plugins, themes, and media to disk
          'wp config set FS_METHOD direct',
          'chown -R apache:apache /var/www/html/$subdomain/*'
        ]
      }
    })
    .promise();

  const instance = await client.query(
    query.Create(query.Collection('wp_instances'), {
      data: {
        name: subdomain,
        user_id: user.data.id,
        command_id: Command.CommandId,
        subscription_item_id: subscriptionItem && subscriptionItem.id
      }
    })
  );

  return instance;
};

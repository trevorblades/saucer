const {AuthenticationError, UserInputError} = require('apollo-server-lambda');
const {
  adjectives,
  animals,
  uniqueNamesGenerator
} = require('unique-names-generator');
const {createInstanceDomain, findInstancesForUser} = require('../utils');
const {generate} = require('randomstring');
const {outdent} = require('outdent');

module.exports = async function createInstance(
  parent,
  args,
  {user, ec2, stripe}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  let subscription;
  if (!args.source) {
    // TODO: fetch instances from fauna
    // https://docs.fauna.com/fauna/current/whitepapers/relational.html#examples
    const instances = await findInstancesForUser(ec2, user);
    if (instances.length) {
      throw new UserInputError(
        'Free trial limit reached. Please provide a payment method.'
      );
    }
  } else {
    subscription = await stripe.subscriptions.create({
      customer: user.data.customerId,
      default_source: args.source,
      items: [{plan: process.env.STRIPE_PLAN_ID_DEV}]
    });
  }

  const subdomain =
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: '-'
    }) +
    '-' +
    generate({
      length: 6,
      charset: 'hex',
      capitalization: 'lowercase'
    });

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

  const document = outdent`
    #!/bin/bash

    # set up some variables
    subdomain=${subdomain}
    dbpass=${generate()}

    # TODO: create mysql user
    # TODO: create mysql db
    # TODO: grant + flush privilages

    # move to public directory
    cd /var/www/html
    mkdir $subdomain
    cd $subdomain

    # https://developer.wordpress.org/cli/commands/core/
    wp core download --locale=${args.locale}

    # https://github.com/wp-cli/config-command
    wp config create \
      --dbname=$subdomain \
      --dbuser=$subdomain \
      --dbpass=$dbpass

    # give wordpress access to filesystem
    echo "define( 'FS_METHOD', 'direct' );" >> wp-config.php
    chown -R apache:apache /var/www/html/*

    wp core install \
      --url=$subdomain.saucer.dev \
      --title=${args.title} \
      --admin_user=${args.adminUser} \
      --admin_password=${args.adminPassword} \
      --admin_email=${args.adminEmail}

    # enable pretty URLs and regenerate .htaccess
    # https://developer.wordpress.org/cli/commands/rewrite/structure/
    cat >> wp-cli.yml <<EOF
    apache_modules:
      - mod_rewrite
    EOF
    touch .htaccess
    wp rewrite structure --hard '/%year%/%monthnum%/%postname%/'

    # install wordpress plugins
    wp plugin install ${wp.join(' ')}
    cd wp-content/plugins
    ${gh.map(plugin => `git clone ${plugin.url}`).join('\n')}
    wp plugin activate ${plugins
      .map(plugin => (typeof plugin === 'string' ? plugin : plugin.name))
      .join(' ')}
  `;

  console.log(document);
  // TODO: run command via SSM

  if (subscription) {
    // update the subscription with metadata about the instance
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        instance_id: 'foo' // TODO: generate instance id
      }
    });
  }

  return {
    // TODO: send instance info
  };
};

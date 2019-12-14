const base64 = require('base-64');
const {AuthenticationError, UserInputError} = require('apollo-server-lambda');
const {
  adjectives,
  animals,
  uniqueNamesGenerator
} = require('unique-names-generator');
const {
  createChangeBatch,
  createInstanceDomain,
  findInstancesForUser,
  findSubscriptionForSource
} = require('../utils');
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

  let subscriptionItem;
  if (!args.source) {
    const instances = await findInstancesForUser(ec2, user);
    if (instances.length) {
      throw new UserInputError(
        'Free trial limit reached. Please provide a payment method.'
      );
    }
  } else {
    // try to find an existing subscription for this source
    const subscription = await findSubscriptionForSource(
      stripe,
      user,
      args.source
    );

    if (subscription) {
      // add a new item to the subscription
      subscriptionItem = await stripe.subscriptionItem.create({
        subscription: subscription.id,
        plan: process.env.STRIPE_PLAN_ID_DEV
      });
    } else {
      // create a subscription if one doesn't exist
      const subscription = await stripe.subscriptions.create({
        customer: user.data.customerId,
        default_source: args.source,
        items: [{plan: process.env.STRIPE_PLAN_ID_DEV}]
      });
      [subscriptionItem] = subscription.items.data;
    }
  }

  const instanceName =
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

  const instanceDomain = createInstanceDomain(instanceName);
  const changeBatch = JSON.stringify(
    JSON.stringify(
      createChangeBatch({
        Action: 'CREATE',
        Name: instanceDomain,
        Value: '$ip_address'
      })
    )
  );

  const UserData = base64.encode(
    outdent`
      #!/bin/bash

      # set up some variables
      dbname=wordpress
      dbpass=${generate()}
      ip_address=$(curl 169.254.169.254/latest/meta-data/public-ipv4)
      instance_id=$(curl 169.254.169.254/latest/meta-data/instance-id)

      # find public IP address and set an A record
      aws route53 change-resource-record-sets \
        --hosted-zone-id ${process.env.ROUTE_53_HOSTED_ZONE_ID} \
        --change-batch ${changeBatch}

      # https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-lamp-amazon-linux-2.html
      # https://certbot.eff.org/lets-encrypt/centosrhel7-apache
      yum update -y
      amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2 epel
      yum install -y httpd mariadb-server git certbot python2-certbot-apache
      systemctl start httpd
      systemctl enable httpd
      systemctl start mariadb
      systemctl enable mariadb

      # https://bertvv.github.io/notes-to-self/2015/11/16/automating-mysql_secure_installation/
      mysql --user=root <<EOF
      UPDATE mysql.user SET Password=PASSWORD('$dbpass') WHERE User='root';
      DELETE FROM mysql.user WHERE User='';
      DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
      DROP DATABASE IF EXISTS test;
      DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
      CREATE DATABASE $dbname;
      FLUSH PRIVILEGES;
      EOF

      # https://make.wordpress.org/cli/handbook/installing/
      curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
      chmod +x wp-cli.phar
      mv wp-cli.phar /usr/bin/wp

      # move to public directory
      cd /var/www/html

      # https://developer.wordpress.org/cli/commands/core/
      wp core download --locale=${args.locale}

      # https://github.com/wp-cli/config-command
      wp config create \
        --dbname=$dbname \
        --dbuser=root \
        --dbpass=$dbpass

      wp core install \
        --url=${instanceDomain} \
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
      wp plugin install wp-fail2ban
      cd wp-content/plugins
      git clone https://github.com/wp-graphql/wp-graphql
      git clone https://github.com/wp-graphql/wp-graphiql
      git clone https://github.com/staticfuse/gatsby-toolkit
      wp plugin activate wp-fail2ban wp-graphql wp-graphiql gatsby-toolkit

      # give wordpress access to filesystem
      echo "define( 'FS_METHOD', 'direct' );" >> wp-config.php
      chown -R apache:apache /var/www/html/*

      # add host for port 80 (needed for certbot)
      cat >> /etc/httpd/conf/httpd.conf <<EOF
      <Directory /var/www/html>
        AllowOverride All
      </Directory>
      <VirtualHost *:80>
        DocumentRoot /var/www/html
        ServerName ${instanceDomain}
      </VirtualHost>
      EOF

      # generate SSL certs and install them
      certbot \
        --non-interactive \
        --apache \
        --agree-tos \
        --email ssl@saucer.dev \
        --domain ${instanceDomain} \
        --redirect

      # set up a cronjob for automatic cert renewal
      echo "39 1,13 * * * root certbot renew --no-self-upgrade" >> /etc/crontab
      systemctl restart crond

      # give an indication that setup has finished
      aws ec2 create-tags \
        --resource "$instance_id" \
        --tags Key=Status,Value=ready \
        --region us-west-2
    `
  );

  const data = await ec2
    .runInstances({
      ImageId: 'ami-0c5204531f799e0c6',
      InstanceType: 't2.micro',
      MinCount: 1,
      MaxCount: 1,
      UserData,
      IamInstanceProfile: {
        Arn: 'arn:aws:iam::724863139036:instance-profile/SaucerRole'
      }
    })
    .promise();

  const [Instance] = data.Instances;
  const Tags = [
    {
      Key: 'Name',
      Value: instanceName
    },
    {
      Key: 'Owner',
      Value: user.data.id
    }
  ];

  // add tags to the newly created instance
  await ec2
    .createTags({
      Resources: [Instance.InstanceId],
      Tags
    })
    .promise();

  if (subscriptionItem) {
    // update the subscription item with metadata about the instance
    await stripe.subscriptionItems.update(subscriptionItem.id, {
      metadata: {
        instance_id: Instance.InstanceId
      }
    });
  }

  return {
    ...Instance,
    Tags
  };
};

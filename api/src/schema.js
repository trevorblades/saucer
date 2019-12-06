import axios from 'axios';
import base64 from 'base-64';
import jwt from 'jsonwebtoken';
import {AuthenticationError, ForbiddenError, gql} from 'apollo-server';
import {EC2, Route53} from 'aws-sdk';
import {GraphQLDateTime} from 'graphql-iso-date';
import {User} from './db';
import {
  adjectives,
  animals,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {generate} from 'randomstring';
import {outdent} from 'outdent';
import {parse} from 'querystring';

const {
  TOKEN_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  AWS_ROUTE_53_HOSTED_ZONE_ID
} = process.env;

export const typeDefs = gql`
  scalar DateTime

  type Query {
    instance(id: ID!): Instance
    instances: [Instance]
  }

  type Mutation {
    logIn(code: String!): String
    createInstance(
      title: String!
      locale: String!
      adminUser: String!
      adminPassword: String!
      adminEmail: String!
    ): Instance
    deleteInstance(id: ID!): ID
  }

  type Instance {
    id: ID
    name: String
    status: String
    createdAt: DateTime
  }
`;

function createChangeBatch(Action, Name, Value) {
  return {
    Changes: [
      {
        Action,
        ResourceRecordSet: {
          Name,
          ResourceRecords: [{Value}],
          TTL: 3600,
          Type: 'A'
        }
      }
    ]
  };
}

function createInstanceDomain(subdomain) {
  return `${subdomain}.saucer.dev`;
}

export const resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    id: instance => instance.InstanceId,
    name: instance => {
      const {Name} = instance.Tags.reduce(
        (acc, tag) => ({
          ...acc,
          [tag.Key]: tag.Value
        }),
        {}
      );
      return Name;
    },
    status: instance => instance.State.Name,
    createdAt: instance => instance.LaunchTime
  },
  Query: {
    async instance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const [instance] = await user.getInstances({InstanceIds: [args.id]});
      if (!instance) {
        throw new ForbiddenError('You do not have access to this instance');
      }

      return instance;
    },
    instances(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      return user.getInstances();
    }
  },
  Mutation: {
    async logIn(parent, args) {
      const accessToken = await axios
        .post('https://github.com/login/oauth/access_token', {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: args.code
        })
        .then(({data}) => parse(data).access_token);

      const githubApi = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
          authorization: `token ${accessToken}`
        }
      });

      const {id, name} = await githubApi
        .get('/user')
        .then(response => response.data);

      let user = await User.findByPk(id);
      if (!user) {
        const [{email}] = await githubApi
          .get('/user/emails')
          .then(({data}) => data.filter(({primary}) => primary));

        user = await User.create({
          id,
          name,
          email
        });
      }

      return jwt.sign(user.get(), TOKEN_SECRET);
    },
    async createInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
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
          capitalization: 'lowercase'
        });

      const instanceDomain = createInstanceDomain(instanceName);
      const changeBatch = JSON.stringify(
        JSON.stringify(
          createChangeBatch('CREATE', instanceDomain, '$ip_address')
        )
      );

      const dbName = 'wordpress';
      const dbPass = generate();

      const UserData = base64.encode(
        outdent`
          #!/bin/bash

          # find public IP address and set an A record
          ip_address=$(curl 169.254.169.254/latest/meta-data/public-ipv4)
          aws route53 change-resource-record-sets \
            --hosted-zone-id ${AWS_ROUTE_53_HOSTED_ZONE_ID} \
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
          UPDATE mysql.user SET Password=PASSWORD('${dbPass}') WHERE User='root';
          DELETE FROM mysql.user WHERE User='';
          DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
          DROP DATABASE IF EXISTS test;
          DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
          CREATE DATABASE ${dbName};
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
            --dbname=${dbName} \
            --dbuser=root \
            --dbpass=${dbPass}

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

          # install wp-graphql plugin
          cd wp-content/plugins
          git clone https://github.com/wp-graphql/wp-graphql
          wp plugin activate wp-graphql

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
        `
      );

      const ec2 = new EC2();
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
          Value: user.id.toString()
        }
      ];

      await ec2
        .createTags({
          Resources: [Instance.InstanceId],
          Tags
        })
        .promise();

      return {
        ...Instance,
        Tags
      };
    },
    async deleteInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const [instance] = await user.getInstances({InstanceIds: [args.id]});
      if (!instance) {
        throw new ForbiddenError('You do not have access to this instance');
      }

      const ec2 = new EC2();
      const {TerminatingInstances} = await ec2
        .terminateInstances({
          InstanceIds: [instance.InstanceId]
        })
        .promise();

      const {Name} = instance.Tags.reduce((acc, tag) => ({
        ...acc,
        [tag.Key]: tag.Value
      }));

      const route53 = new Route53();
      const instanceDomain = createInstanceDomain(Name);
      const StartRecordName = instanceDomain + '.';

      // check for DNS records for this instance
      const {ResourceRecordSets} = await route53
        .listResourceRecordSets({
          HostedZoneId: AWS_ROUTE_53_HOSTED_ZONE_ID,
          StartRecordName,
          StartRecordType: 'A',
          MaxItems: '1'
        })
        .promise();

      if (
        ResourceRecordSets.length &&
        ResourceRecordSets[0].Name === StartRecordName
      ) {
        // clean them up if they exist
        await route53
          .changeResourceRecordSets({
            HostedZoneId: AWS_ROUTE_53_HOSTED_ZONE_ID,
            ChangeBatch: createChangeBatch(
              'DELETE',
              instanceDomain,
              instance.PublicIpAddress
            )
          })
          .promise();
      }

      return TerminatingInstances[0].InstanceId;
    }
  }
};

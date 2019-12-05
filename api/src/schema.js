import axios from 'axios';
import base64 from 'base-64';
import jwt from 'jsonwebtoken';
import {AuthenticationError, ForbiddenError, gql} from 'apollo-server';
import {EC2} from 'aws-sdk';
import {GraphQLDateTime} from 'graphql-iso-date';
import {User} from './db';
import {generate} from 'generate-password';
import {outdent} from 'outdent';
import {parse} from 'querystring';

export const typeDefs = gql`
  scalar DateTime

  type Query {
    instance(id: ID!): Instance
    instances: [Instance]
  }

  type Mutation {
    logIn(code: String!): String
    createInstance(
      name: String!
      locale: String!
      title: String!
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
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
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

      return jwt.sign(user.get(), process.env.TOKEN_SECRET);
    },
    async createInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const dbName = 'wordpress';
      const dbPass = generate();

      const UserData = base64.encode(
        outdent`
          #!/bin/bash
          # https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-lamp-amazon-linux-2.html
          yum update -y
          amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2
          yum install -y httpd mariadb-server
          systemctl start httpd
          systemctl enable httpd
          systemctl start mariadb
          systemctl enable mariadb

          # https://bertvv.github.io/notes-to-self/2015/11/16/automating-mysql_secure_installation/
          mysql --user=root <<_EOF_
            UPDATE mysql.user SET Password=PASSWORD('${dbPass}') WHERE User='root';
            DELETE FROM mysql.user WHERE User='';
            DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
            DROP DATABASE IF EXISTS test;
            DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
            CREATE DATABASE ${dbName};
            FLUSH PRIVILEGES;
          _EOF_

          # https://make.wordpress.org/cli/handbook/installing/
          curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
          chmod +x wp-cli.phar
          mv wp-cli.phar /usr/bin/wp

          # move to public directory
          cd /var/www/html

          # https://developer.wordpress.org/cli/commands/core/
          wp core download --locale=${args.locale}

          # https://github.com/wp-cli/config-command
          wp config create --dbname=${dbName} --dbuser=root --dbpass=${dbPass}

          wp core install --url=${args.name}.saucer.dev \
            --title=${args.title} \
            --admin_user=${args.adminUser} \
            --admin_password=${args.adminPassword} \
            --admin_email=${args.adminEmail}

          # install wp-graphql plugin
          cd wp-content/plugins
          yum install git
          git clone https://github.com/wp-graphql/wp-graphql
          wp plugins activate wp-graphql
        `
      );

      const ec2 = new EC2();
      const data = await ec2
        .runInstances({
          ImageId: 'ami-0c5204531f799e0c6',
          InstanceType: 't2.micro',
          MinCount: 1,
          MaxCount: 1,
          UserData
        })
        .promise();

      const [Instance] = data.Instances;
      const Tags = [
        {
          Key: 'Name',
          Value: args.name
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

      return TerminatingInstances[0].InstanceId;
    }
  }
};

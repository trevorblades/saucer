import AWS from 'aws-sdk';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {AuthenticationError, ForbiddenError, gql} from 'apollo-server';
// import {Client} from 'ssh2';
import base64 from 'base-64';
import {GraphQLDateTime} from 'graphql-iso-date';
import {User} from './db';
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
    createInstance(name: String!): Instance
    provisionInstance(
      id: ID!
      email: String!
      username: String!
      password: String!
      title: String!
    ): Instance
    deleteInstance(id: ID!): Instance
  }

  type Instance {
    id: ID
    name: String
    status: String
    createdAt: DateTime
  }
`;

// function createConnection(host) {
//   return new Promise((resolve, reject) => {
//     const client = new Client();
//     client
//       .on('ready', () => {
//         resolve(client);
//       })
//       .on('error', reject)
//       .connect({
//         host,
//         username: 'root',
//         privateKey: process.env.PRIVATE_KEY
//       });
//   });
// }

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

      const ec2 = new AWS.EC2();
      const data = await ec2
        .runInstances({
          ImageId: 'ami-0c5204531f799e0c6',
          InstanceType: 't2.micro',
          MinCount: 1,
          MaxCount: 1,
          UserData: base64.encode(
            outdent`
              #!/bin/bash
              yum update -y
              amazon-linux-extras install -y lamp-mariadb10.2-php7.2 php7.2
              yum install -y httpd mariadb-server
              systemctl start httpd
              systemctl enable httpd
            `
          )
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
    async provisionInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }
    },
    async deleteInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }
    }
  }
};

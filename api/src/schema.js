import AWS from 'aws-sdk';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {AuthenticationError, gql} from 'apollo-server';
import {GraphQLDateTime} from 'graphql-iso-date';
import {User} from './db';
import {parse} from 'querystring';
// import {Client} from 'ssh2';

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
    tags: [String]
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
    createdAt: instance => instance.created_at
  },
  Query: {
    async instance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }
    },
    async instances(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }
      return [];
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
      const {KeyName} = await ec2.createKeyPair({KeyName: args.name}).promise();
      const data = await ec2
        .runInstances({
          ImageId: 'ami-0c5204531f799e0c6',
          InstanceType: 't2.micro',
          KeyName,
          MinCount: 1,
          MaxCount: 1
        })
        .promise();
      console.log(data);

      throw new Error('what');
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

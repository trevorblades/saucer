import axios from 'axios';
import jwt from 'jsonwebtoken';
import {AuthenticationError, UserInputError, gql} from 'apollo-server';
import {Instance, User} from './db';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator';
import {parse} from 'querystring';

export const typeDefs = gql`
  type Query {
    instances: [Instance]
  }

  type Mutation {
    logIn(code: String!): String
    createInstance: Instance
  }

  type Instance {
    id: ID
    name: String
    status: String
  }
`;

export const resolvers = {
  Query: {
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
          .get('/user/emails', {
            headers: {
              authorization: `token ${accessToken}`
            }
          })
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

      const name = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        separator: '-'
      });

      try {
        const response = await axios.post(
          'https://api.digitalocean.com/v2/droplets',
          {
            name,
            region: 'sfo2',
            size: 's-1vcpu-1gb',
            image: 'wordpress-18-04'
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DIGITAL_OCEAN_ACCESS_TOKEN}`
            }
          }
        );

        return Instance.create({
          id: response.data.droplet.id,
          userId: user.id
        });
      } catch (error) {
        throw new UserInputError(error);
      }
    }
  }
};

import axios from 'axios';
import {AuthenticationError, UserInputError, gql} from 'apollo-server';
import {Instance} from './db';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator';

export const typeDefs = gql`
  type Query {
    instances: [Instance]
  }

  type Mutation {
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
    async createInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      try {
        const name = uniqueNamesGenerator({
          dictionaries: [colors, adjectives, animals],
          separator: '-'
        });

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

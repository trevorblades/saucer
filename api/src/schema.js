import createInstance from './resolvers/create-instance';
import deleteInstance from './resolvers/delete-instance';
import logIn from './resolvers/log-in';
import {AuthenticationError, ForbiddenError, gql} from 'apollo-server';
import {GraphQLDateTime} from 'graphql-iso-date';
import {findInstancesForUser} from './utils';

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
    isReady: Boolean
    createdAt: DateTime
  }
`;

function reduceTags(tags) {
  return tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.Key]: tag.Value
    }),
    {}
  );
}

export const resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    id: instance => instance.InstanceId,
    name: instance => {
      const {Name} = reduceTags(instance.Tags);
      return Name;
    },
    status: instance => instance.State.Name,
    isReady: instance => {
      const {Status} = reduceTags(instance.Tags);
      return Status === 'ready';
    },
    createdAt: instance => instance.LaunchTime
  },
  Query: {
    async instance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const [instance] = await findInstancesForUser(user, {
        InstanceIds: [args.id]
      });

      if (!instance) {
        throw new ForbiddenError('You do not have access to this instance');
      }

      return instance;
    },
    instances(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      return findInstancesForUser(user);
    }
  },
  Mutation: {
    logIn,
    createInstance,
    deleteInstance
  }
};

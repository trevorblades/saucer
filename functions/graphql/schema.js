const createInstance = require('./resolvers/create-instance');
const deleteInstance = require('./resolvers/delete-instance');
const logIn = require('./resolvers/log-in');
const createCard = require('./resolvers/create-card');
const {
  AuthenticationError,
  ForbiddenError,
  gql
} = require('apollo-server-lambda');
const {GraphQLDateTime} = require('graphql-iso-date');
const {findInstancesForUser} = require('./utils');

exports.typeDefs = gql`
  scalar DateTime

  type Query {
    instance(id: ID!): Instance
    instances: [Instance]
    cards: [Card]
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
    createCard(source: String!, isDefault: Boolean): Card
  }

  type Card {
    id: ID
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

exports.resolvers = {
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
    },
    async cards(parent, args, {user, stripe}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const {customerId} = user.data;
      if (!customerId) {
        return [];
      }

      const response = await stripe.customers.listSources(customerId);
      return response.data;
    }
  },
  Mutation: {
    logIn,
    createInstance,
    deleteInstance,
    createCard
  }
};

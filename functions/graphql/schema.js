const createInstance = require('./resolvers/create-instance');
const deleteInstance = require('./resolvers/delete-instance');
const startInstance = require('./resolvers/start-instance');
const stopInstance = require('./resolvers/stop-instance');
const logIn = require('./resolvers/log-in');
const createCard = require('./resolvers/create-card');
const deleteCard = require('./resolvers/delete-card');
const {
  AuthenticationError,
  ForbiddenError,
  gql
} = require('apollo-server-lambda');
const {GraphQLDateTime} = require('graphql-iso-date');
const {findInstancesForUser, findInstanceForUser} = require('./utils');

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
      source: String
    ): Instance
    deleteInstance(id: ID!): ID
    startInstance(id: ID!, source: String!): Instance
    stopInstance(id: ID!): Instance
    createCard(source: String!, isDefault: Boolean): Card
    deleteCard(id: ID!): ID
  }

  type Card {
    id: ID
    brand: String
    last4: String
    expMonth: Int
    expYear: Int
    isDefault: Boolean
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
    name(instance) {
      const {Name} = reduceTags(instance.Tags);
      return Name;
    },
    status: instance => instance.State.Name,
    isReady(instance) {
      const {Status} = reduceTags(instance.Tags);
      return Status === 'ready';
    },
    createdAt: instance => instance.LaunchTime
  },
  Card: {
    expMonth: card => card.exp_month,
    expYear: card => card.exp_year,
    async isDefault(card, args, {stripe}) {
      const customer = await stripe.customers.retrieve(card.customer);
      return card.id === customer.default_source;
    }
  },
  Query: {
    async instance(parent, args, {user, ec2}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const instance = await findInstanceForUser(ec2, user, args.id);
      if (!instance) {
        throw new ForbiddenError('You do not have access to this instance');
      }

      return instance;
    },
    instances(parent, args, {ec2, user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      return findInstancesForUser(ec2, user);
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
    startInstance,
    stopInstance,
    createCard,
    deleteCard
  }
};

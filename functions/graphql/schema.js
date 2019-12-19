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
const {query} = require('faunadb');
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
      plugins: PluginsInput!
      source: String
    ): Instance
    deleteInstance(id: ID!): ID
    startInstance(id: ID!, source: String!): Instance
    stopInstance(id: ID!): Instance
    createCard(source: String!, isDefault: Boolean): Card
    deleteCard(id: ID!): ID
  }

  input PluginsInput {
    acf: Boolean
    woocommerce: Boolean
    polylang: Boolean
  }

  type Card {
    id: ID
    brand: String
    last4: String
    expMonth: Int
    expYear: Int
    isDefault: Boolean
    instances: [Instance]
  }

  type Instance {
    id: ID
    name: String
    status: String
    createdAt: DateTime
  }
`;

exports.resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    id: instance => instance.ref.id,
    name: instance => instance.data.name,
    status: instance => instance.data.status,
    createdAt: instance => new Date(instance.ts / 1000)
  },
  Card: {
    expMonth: card => card.exp_month,
    expYear: card => card.exp_year,
    async isDefault(card, args, {stripe}) {
      const customer = await stripe.customers.retrieve(card.customer);
      return card.id === customer.default_source;
    },
    async instances(card, args, {ec2, stripe, user}) {
      const {data} = await stripe.subscriptions.list({
        customer: user.data.customer_id
      });

      const instanceIds = data
        .filter(subscription => subscription.default_source === card.id)
        .map(subscription => subscription.metadata.instance_id);
      if (!instanceIds.length) {
        return [];
      }

      return findInstancesForUser(ec2, user, {
        InstanceIds: instanceIds
      });
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
    async instances(parent, args, {client, user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const {data} = await client.query(
        query.Map(
          query.Paginate(
            query.Match(query.Index('wp_instances_by_user_id'), user.data.id)
          ),
          query.Lambda('X', query.Get(query.Var('X')))
        )
      );

      return data;
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

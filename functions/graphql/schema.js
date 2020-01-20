const createInstance = require('./resolvers/create-instance');
const deleteInstance = require('./resolvers/delete-instance');
const updateInstance = require('./resolvers/update-instance');
const createCard = require('./resolvers/create-card');
const deleteCard = require('./resolvers/delete-card');
const {gql} = require('apollo-server-lambda');
const {query} = require('faunadb');
const {GraphQLDateTime} = require('graphql-iso-date');
const {findInstance, paginateInstancesForUser} = require('./utils');

exports.typeDefs = gql`
  scalar DateTime

  type Query {
    instance(id: ID!): Instance
    instances: [Instance]
    cards: [Card]
    defaultCard: Card
  }

  type Mutation {
    createInstance(
      title: String!
      locale: String!
      adminUser: String!
      adminPassword: String!
      adminEmail: String!
      plugins: PluginsInput!
      plan: String
    ): Instance
    updateInstance(id: ID!, plan: String!): Instance
    deleteInstance(id: ID!): Instance
    createCard(source: String!, isDefault: Boolean): Card
    deleteCard(id: ID!): Card
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
  }

  type Instance {
    id: ID
    name: String
    status: String
    expiresAt: DateTime
    updatedAt: DateTime
    subscription: Subscription
  }

  type Subscription {
    plan: Plan
  }

  type Plan {
    amount: Int
    interval: String
  }
`;

exports.resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    id: instance => instance.ref.id,
    name: instance => instance.data.name,
    async status(instance, args, {ssm}) {
      const data = await ssm
        .getCommandInvocation({
          CommandId: instance.data.command_id,
          InstanceId: process.env.AWS_EC2_INSTANCE_ID
        })
        .promise();
      return data.Status;
    },
    expiresAt: instance => instance.data.expires_at / 1000,
    updatedAt: instance => instance.ts / 1000000,
    subscription: (instance, args, {stripe}) =>
      instance.data.subscription_item_id
        ? stripe.subscriptionItems.retrieve(instance.data.subscription_item_id)
        : null
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
    instance: (parent, args, {user, client}) =>
      findInstance(client, user, args.id),
    async instances(parent, args, {client, user}) {
      const {data} = await client.query(
        query.Map(
          paginateInstancesForUser(user),
          query.Lambda('X', query.Get(query.Var('X')))
        )
      );

      return data;
    },
    async defaultCard(parent, args, {user, stripe}) {
      const customerId = user.data.customer_id;
      if (!customerId) {
        return null;
      }

      const customer = await stripe.customers.retrieve(customerId);
      return (
        customer.default_source &&
        stripe.customers.retrieveSource(customer.id, customer.default_source)
      );
    },
    async cards(parent, args, {user, stripe}) {
      const customerId = user.data.customer_id;
      if (!customerId) {
        return [];
      }

      const response = await stripe.customers.listSources(customerId);
      return response.data;
    }
  },
  Mutation: {
    createInstance,
    updateInstance,
    deleteInstance,
    createCard,
    deleteCard
  }
};

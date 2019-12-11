const createInstance = require('./resolvers/create-instance');
const deleteInstance = require('./resolvers/delete-instance');
const logIn = require('./resolvers/log-in');
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
    paymentMethods: [PaymentMethod]
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

  type PaymentMethod {
    id: ID
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
    paymentMethods(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      return [];
    }
  },
  Mutation: {
    logIn,
    createInstance,
    deleteInstance
  }
};

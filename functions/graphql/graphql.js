const Stripe = require('stripe');
const jwt = require('jsonwebtoken');
const {SSM} = require('aws-sdk');
const {AuthenticationError, ApolloServer} = require('apollo-server-lambda');
const {Client, query} = require('faunadb');
const {resolvers, typeDefs} = require('./schema');

const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  FAUNADB_SERVER_SECRET,
  TOKEN_SECRET,
  NETLIFY_DEV,
  STRIPE_SECRET_KEY_DEV,
  STRIPE_SECRET_KEY_PROD
} = process.env;

const ssm = new SSM({
  region: 'us-west-2',
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

const client = new Client({
  secret: FAUNADB_SERVER_SECRET
});

const stripe = Stripe(
  NETLIFY_DEV ? STRIPE_SECRET_KEY_DEV : STRIPE_SECRET_KEY_PROD
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({event}) {
    try {
      const matches = event.headers.authorization.match(/bearer (\S+)/i);
      const {sub} = jwt.verify(matches[1], TOKEN_SECRET);
      const user = await client.query(
        query.Get(query.Ref(query.Collection('users'), sub))
      );

      return {
        user,
        ssm,
        client,
        stripe
      };
    } catch (error) {
      throw new AuthenticationError('Unauthorized');
    }
  }
});

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true
  }
});

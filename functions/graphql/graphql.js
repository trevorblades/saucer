const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const {ApolloServer} = require('apollo-server-lambda');
const {Client, query} = require('faunadb');
const {resolvers, typeDefs} = require('./schema');

const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  FAUNADB_SERVER_SECRET,
  TOKEN_SECRET
} = process.env;

AWS.config.update({
  region: 'us-west-2',
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

const client = new Client({
  secret: FAUNADB_SERVER_SECRET
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({event}) {
    let user;
    if (event.headers.authorization) {
      const matches = event.headers.authorization.match(/bearer (\S+)/i);
      try {
        const {sub} = jwt.verify(matches[1], TOKEN_SECRET);
        const response = await client.query(
          query.Get(query.Ref(query.Collection('users'), sub))
        );
        user = response.data;
      } catch (error) {
        console.log(error);
        // let errors pass
      }
    }

    return {
      user,
      client
    };
  }
});

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true
  }
});

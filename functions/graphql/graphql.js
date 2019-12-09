const jwt = require('jsonwebtoken');
const {ApolloServer} = require('apollo-server-lambda');
const {Client, query} = require('faunadb');
const {resolvers, typeDefs} = require('./schema');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});

const client = new Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({event}) {
    let user;
    if (event.headers.authorization) {
      const matches = event.headers.authorization.match(/bearer (\S+)/i);
      try {
        const {sub} = jwt.verify(matches[1], process.env.TOKEN_SECRET);
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

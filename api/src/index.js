import jwt from 'jsonwebtoken';
import {ApolloServer} from 'apollo-server';
import {Client, query as q} from 'faunadb';
import {resolvers, typeDefs} from './schema';

const client = new Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({req}) {
    let user;
    if (req.headers.authorization) {
      const matches = req.headers.authorization.match(/bearer (\S+)/i);
      try {
        const {sub} = jwt.verify(matches[1], process.env.TOKEN_SECRET);
        const response = await client.query(
          q.Get(q.Ref(q.Collection('users'), sub))
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

server
  .listen({port: process.env.PORT})
  .then(({url}) => console.log(`🛸 Server ready at ${url}`));

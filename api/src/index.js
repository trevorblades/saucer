import jwt from 'jsonwebtoken';
import {ApolloServer} from 'apollo-server';
import {User, sequelize} from './db';
import {resolvers, typeDefs} from './schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({req}) {
    if (req.headers.authorization) {
      const matches = req.headers.authorization.match(/bearer (\S+)/i);
      try {
        const {id} = jwt.verify(matches[1], process.env.TOKEN_SECRET);
        const user = await User.findByPk(id);
        return {user};
      } catch (error) {
        // let errors pass
      }
    }
    return {};
  }
});

sequelize
  .sync()
  .then(() => server.listen({port: process.env.PORT}))
  .then(({url}) => console.log(`🛸 Server ready at ${url}`));

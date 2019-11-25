import {Sequelize} from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

import {Sequelize} from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

export const Instance = sequelize.define('instance', {
  expiresAt: Sequelize.DATE
});

Instance.belongsTo(User);
User.hasMany(Instance);

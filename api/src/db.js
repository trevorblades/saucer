import {EC2} from 'aws-sdk';
import {Sequelize} from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

async function getInstances(options) {
  const ec2 = new EC2();
  const {Reservations} = await ec2
    .describeInstances({
      ...options,
      Filters: [
        {
          Name: 'tag:Owner',
          Values: [this.id.toString()]
        },
        {
          Name: 'instance-state-name',
          Values: ['pending', 'running', 'stopping', 'stopped']
        }
      ]
    })
    .promise();
  return Reservations.flatMap(reservation => reservation.Instances);
}

User.prototype.getInstances = getInstances;

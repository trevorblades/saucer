import EC2 from 'aws-sdk/clients/ec2';
import {Sequelize} from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

async function getInstances(options) {
  const ec2 = new EC2();
  const data = await ec2
    .describeInstances({
      ...options,
      Filters: [
        {
          Name: 'tag:Owner',
          Values: [this.id.toString()]
        }
      ]
    })
    .promise();
  return data.Reservations.length ? data.Reservations[0].Instances : [];
}

User.prototype.getInstances = getInstances;

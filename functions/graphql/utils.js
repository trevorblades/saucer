const EC2 = require('aws-sdk/clients/ec2');

exports.findInstancesForUser = async (user, options) => {
  const ec2 = new EC2();
  const {Reservations} = await ec2
    .describeInstances({
      ...options,
      Filters: [
        {
          Name: 'tag:Owner',
          Values: [user.id]
        },
        {
          Name: 'instance-state-name',
          Values: ['pending', 'running', 'stopping', 'stopped']
        }
      ]
    })
    .promise();
  return Reservations.flatMap(reservation => reservation.Instances);
};

exports.createChangeBatch = (Action, Name, Value) => {
  return {
    Changes: [
      {
        Action,
        ResourceRecordSet: {
          Name,
          ResourceRecords: [{Value}],
          TTL: 300,
          Type: 'A'
        }
      }
    ]
  };
};

exports.createInstanceDomain = subdomain => subdomain + '.saucer.dev';

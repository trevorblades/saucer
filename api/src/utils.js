import {EC2} from 'aws-sdk';

export async function findInstancesForUser(user, options) {
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
}

export function createChangeBatch(Action, Name, Value) {
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
}

export function createInstanceDomain(subdomain) {
  return subdomain + '.saucer.dev';
}

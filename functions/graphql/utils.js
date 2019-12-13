async function findInstancesForUser(ec2, user, options) {
  const {Reservations} = await ec2
    .describeInstances({
      ...options,
      Filters: [
        {
          Name: 'tag:Owner',
          Values: [user.data.id]
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

exports.findInstancesForUser = findInstancesForUser;
exports.findInstanceForUser = async (ec2, user, id) => {
  const [instance] = await findInstancesForUser(ec2, user, {
    InstanceIds: [id]
  });
  return instance;
};

exports.createChangeBatch = ({Action, Name, Value}) => ({
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
});

exports.createInstanceDomain = subdomain => subdomain + '.saucer.dev';

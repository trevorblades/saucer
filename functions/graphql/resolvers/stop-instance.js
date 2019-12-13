const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {findInstancesForUser} = require('../utils');

module.exports = async function stopInstance(parent, args, {user, ec2}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const [instance] = await findInstancesForUser(ec2, user, {
    InstanceIds: [args.id]
  });

  if (!instance) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  const data = await ec2.stopInstances({InstanceIds: [args.id]});
  return data.Instances[0];
};

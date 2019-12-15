const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {findInstanceForUser} = require('../utils');

module.exports = async function stopInstance(parent, args, {user, ec2}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const instance = await findInstanceForUser(ec2, user, args.id);
  if (!instance) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  const data = await ec2
    .stopInstances({InstanceIds: [instance.InstanceId]})
    .promise();
  return data.Instances[0];
};

const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {findInstanceForUser} = require('../utils');

module.exports = async function startInstance(
  parent,
  args,
  {user, ec2, stripe}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const instance = await findInstanceForUser(ec2, user, args.id);
  if (!instance) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  const subscription = await stripe.subscriptions.create({
    customer: user.data.customerId,
    default_source: args.source,
    items: [{plan: process.env.STRIPE_PLAN_ID_DEV}],
    metadata: {
      instance_id: instance.InstanceId
    }
  });

  const [data] = await Promise.all([
    ec2.startInstances({InstanceIds: [instance.InstanceId]}).promise(),
    ec2
      .createTags({
        Resources: [instance.InstanceId],
        Tags: [
          {
            Key: 'Subscription',
            Value: subscription.id
          }
        ]
      })
      .promise()
  ]);

  return data.Instances[0];
};

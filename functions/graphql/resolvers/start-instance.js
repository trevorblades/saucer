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

  const {customerId} = user.data;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId
  });

  const subscription = subscriptions.data.find(
    ({metadata}) => metadata.instance_id === args.id
  );

  // create or update a subscription before proceeding
  if (!subscription) {
    await stripe.subscriptions.create({
      customer: customerId,
      default_source: args.source,
      items: [{plan: process.env.STRIPE_PLAN_ID_DEV}],
      metadata: {
        instance_id: args.id
      }
    });
  } else if (subscription.default_source !== args.source) {
    await stripe.subscriptions.update(subscription.id, {
      default_source: args.source
    });
  }

  const data = await ec2.startInstances({InstanceIds: [args.id]});
  return data.Instances[0];
};

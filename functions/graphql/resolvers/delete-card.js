const {AuthenticationError} = require('apollo-server-lambda');
const {findSubscriptionForSource} = require('../utils');

module.exports = async function deleteCard(parent, args, {user, ec2, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const source = await stripe.customers.deleteSource(
    user.data.customerId,
    args.id
  );

  const subscription = await findSubscriptionForSource(stripe, user, source.id);

  // cancel the subscription and stop associated instances
  await Promise.all([
    stripe.subscriptions.del(subscription.id),
    ...subscription.items.map(item =>
      ec2
        .stopInstances({
          InstanceIds: [item.metadata.instance_id]
        })
        .promise()
    )
  ]);

  return source.id;
};

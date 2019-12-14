const {AuthenticationError} = require('apollo-server-lambda');

module.exports = async function deleteCard(parent, args, {user, ec2, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const source = await stripe.customers.deleteSource(
    user.data.customerId,
    args.id
  );

  const {data} = await stripe.subscriptions.list({
    customer: user.data.customerId
  });

  // cancel all subscriptions for this source and stop associated instances
  await Promise.all(
    data
      .filter(subscription => subscription.default_source === source.id)
      .flatMap(subscription => [
        stripe.subscriptions.del(subscription.id),
        ec2
          .stopInstances({
            InstanceIds: [subscription.metadata.instance_id]
          })
          .promise()
      ])
  );

  return source.id;
};

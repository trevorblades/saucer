const {AuthenticationError} = require('apollo-server-lambda');

module.exports = async function deleteCard(parent, args, {user, ec2, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const {data} = await stripe.subscriptions.list({
    customer: user.data.customer_id
  });

  // cancel all subscriptions for this source and stop associated instances
  await Promise.all(
    data
      .filter(subscription => subscription.default_source === args.id)
      .flatMap(subscription => [
        stripe.subscriptions.del(subscription.id),
        ec2
          .stopInstances({
            InstanceIds: [subscription.metadata.instance_id]
          })
          .promise()
      ])
  );

  // then delete the card
  const source = await stripe.customers.deleteSource(
    user.data.customer_id,
    args.id
  );

  return source.id;
};

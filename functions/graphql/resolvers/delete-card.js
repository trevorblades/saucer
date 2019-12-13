const {AuthenticationError} = require('apollo-server-lambda');
const {EC2} = require('aws-sdk');

module.exports = async function deleteCard(parent, args, {user, stripe}) {
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

  const ec2 = new EC2();
  const promises = data
    .filter(subscription => subscription.default_source === source.id)
    .flatMap(subscription => [
      // cancel the subscription and stop associated instances
      stripe.subscriptions.del(subscription.id),
      ec2
        .stopInstances({InstanceIds: [subscription.metadata.instance_id]})
        .promise()
    ]);

  await Promise.all(promises);
  return source.id;
};

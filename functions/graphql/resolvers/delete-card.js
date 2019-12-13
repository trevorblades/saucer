const {AuthenticationError} = require('apollo-server-lambda');

module.exports = async function deleteCard(parent, args, {user, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const source = await stripe.customers.deleteSource(
    user.data.customerId,
    args.id
  );

  const subscriptions = await stripe.subscriptions.list({
    customer: user.data.customerId
  });

  await Promise.all(
    subscriptions
      .filter(subscription => subscription.default_source === source.id)
      .map(subscription => stripe.subscriptions.del(subscription.id))
  );

  // TODO: stop instances

  return source.id;
};

const {AuthenticationError} = require('apollo-server-lambda');

module.exports = async function deleteCard(parent, args, {user, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const source = await stripe.customers.deleteSource(
    user.data.customerId,
    args.id
  );

  // TODO: cancel subscriptions
  // TODO: stop instances

  return source.id;
};

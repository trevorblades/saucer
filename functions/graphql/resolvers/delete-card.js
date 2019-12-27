const {AuthenticationError, UserInputError} = require('apollo-server-lambda');

module.exports = async function deleteCard(parent, args, {user, stripe}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const customer = user.data.customer_id;
  const sources = await stripe.customers.listSources(customer);
  if (sources.data.length === 1) {
    // make sure there is a backup card before deleting the default
    const subscriptions = await stripe.subscriptions.list({customer});
    if (subscriptions.data.length) {
      // only if there are existing subscriptions
      throw new UserInputError(
        'Delete your paid instances or add a new payment method before deleting this card.'
      );
    }
  }

  return stripe.customers.deleteSource(customer, args.id);
};

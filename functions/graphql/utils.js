const {query} = require('faunadb');
const {ForbiddenError, UserInputError} = require('apollo-server-lambda');

exports.findInstance = async (client, user, id) => {
  const instance = await client.query(
    query.Get(query.Ref(query.Collection('wp_instances'), id))
  );

  if (instance.data.user_id !== user.data.id) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  return instance;
};

exports.paginateInstancesForUser = user =>
  query.Paginate(
    query.Match(query.Index('wp_instances_by_user_id'), user.data.id)
  );

exports.createSubscriptionItem = async (stripe, user, plan) => {
  // ensure the user has a customer id
  if (user.data.customer_id) {
    // check if they have a card before proceeding
    const sources = await stripe.customers.listSources(user.data.customer_id);
    if (sources.data.length) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.data.customer_id
      });

      const subscriptionItem = subscriptions.data
        .flatMap(subscription => subscription.items.data)
        .find(item => item.plan.id === plan);

      if (subscriptionItem) {
        // if a sub item exists for this plan, increment the quantity
        return stripe.subscriptionItems.update(subscriptionItem.id, {
          quantity: subscriptionItem.quantity + 1
        });
      } else {
        // otherwise create a new subscription with a quantity of 1
        const subscription = await stripe.subscriptions.create({
          customer: user.data.customer_id,
          items: [
            {
              plan,
              quantity: 1
            }
          ]
        });

        return subscription.items.data[0];
      }
    }
  }

  throw new UserInputError(
    'You selected a paid plan. Add a valid payment method in your billing settings to create this instance.'
  );
};

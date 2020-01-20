const {findInstance, createSubscriptionItem} = require('../utils');
const {query} = require('faunadb');

module.exports = async function updateInstance(
  parent,
  args,
  {user, client, stripe}
) {
  const instance = await findInstance(client, user, args.id);
  const subscriptionItem = await createSubscriptionItem(
    stripe,
    user,
    args.plan
  );

  return client.query(
    query.Update(instance.ref, {
      data: {
        expires_at: null,
        subscription_item_id: subscriptionItem.id
      }
    })
  );
};

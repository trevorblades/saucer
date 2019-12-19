const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {findInstanceForUser} = require('../utils');

module.exports = async function deleteInstance(
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

  const customerId = user.data.customer_id;
  if (customerId) {
    const {data} = await stripe.subscriptions.list({
      customer: customerId
    });

    for (const subscription of data) {
      // try to find a subscription for this instance
      if (subscription.metadata.instance_id === instance.InstanceId) {
        // cancel the entire subscription if it's the only item
        await stripe.subscriptions.del(subscription.id);
        break;
      }
    }
  }
};

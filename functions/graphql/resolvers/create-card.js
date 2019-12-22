const {AuthenticationError} = require('apollo-server-lambda');
const {query} = require('faunadb');

module.exports = async function createCard(
  parent,
  args,
  {user, stripe, client}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  let customerId = user.data.customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.data.email
    });

    const {data} = await client.query(
      query.Update(user.ref, {
        data: {
          customer_id: customer.id
        }
      })
    );

    customerId = data.customer_id;
  }

  const source = await stripe.customers.createSource(customerId, {
    source: args.source
  });

  if (args.isDefault) {
    await stripe.customers.update(customerId, {
      default_source: source.id
    });
  }

  return source;
};

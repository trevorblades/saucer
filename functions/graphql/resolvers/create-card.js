const {AuthenticationError} = require('apollo-server-lambda');
const {query} = require('faunadb');

async function getCustomerId({user, stripe, client}) {
  if ('customerId' in user.data) {
    return user.data.customerId;
  }

  const customer = await stripe.customers.create({
    email: user.data.email
  });

  const {data} = await client.query(
    query.Update(user.ref, {
      data: {
        customerId: customer.id
      }
    })
  );

  return data.customerId;
}

module.exports = async function createCard(
  parent,
  args,
  {user, stripe, client}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const customerId = await getCustomerId({user, stripe, client});
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

module.exports = async function updateCard(parent, args, {user, stripe}) {
  const {default_source} = await stripe.customers.update(
    user.data.customer_id,
    {
      default_source: args.id,
      expand: ['default_source'] // this is dope 🔥
    }
  );
  return default_source;
};

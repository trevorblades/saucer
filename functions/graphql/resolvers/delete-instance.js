const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {query} = require('faunadb');
const outdent = require('outdent');

module.exports = async function deleteInstance(
  parent,
  args,
  {user, client, stripe, ssm}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const instance = await client.query(
    query.Get(query.Ref(query.Collection('wp_instances'), args.id))
  );

  if (instance.data.user_id !== user.data.id) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  if ('subscription_item_id' in instance.data) {
    // adjust the associated subscription
    const subscriptionItem = await stripe.subscriptionItems.retrieve(
      instance.data.subscription_item_id
    );
    if (subscriptionItem.quantity > 1) {
      // decrement the quantity if there are multiple
      await stripe.subscriptionItems.update(subscriptionItem.id, {
        quantity: subscriptionItem.quantity - 1
      });
    } else {
      // otherwise delete the entire subscription
      await stripe.subscriptions.del(subscriptionItem.subscription);
    }
  }

  const {Command} = await ssm
    .sendCommand({
      InstanceIds: [process.env.AWS_EC2_INSTANCE_ID],
      DocumentName: 'AWS-RunShellScript',
      Parameters: {
        commands: [
          `dbname=${instance.data.name.replace(/-/g, '_')}`,
          outdent`
            mysql -u root << EOF
            REVOKE ALL PRIVILEGES, GRANT OPTION FROM $dbname@'localhost';
            DROP USER $dbname@'localhost';
            DROP DATABASE $dbname;
            FLUSH PRIVILEGES;
            EOF
          `,
          `rm -rf /var/www/html/${instance.data.name}`
        ]
      }
    })
    .promise();

  let status = Command.Status;
  while (['Pending', 'Delayed', 'InProgress'].includes(status)) {
    // keep checking command status until it's completed
    const data = await ssm
      .getCommandInvocation({
        InstanceId: process.env.AWS_EC2_INSTANCE_ID,
        CommandId: Command.CommandId
      })
      .promise();
    status = data.Status;
  }

  return client.query(query.Delete(instance.ref));
};

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

  if ('customer_id' in user.data) {
    const {data} = await stripe.subscriptions.list({
      customer: user.data.customer_id
    });

    for (const subscription of data) {
      // try to find a subscription for this instance
      if (subscription.metadata.instance_id === instance.ref.id) {
        // cancel the subscription and stop looking for others
        await stripe.subscriptions.del(subscription.id);
        break;
      }
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

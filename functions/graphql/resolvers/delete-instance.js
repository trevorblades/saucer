const {findInstance} = require('../utils');
const {outdent} = require('outdent');
const {query} = require('faunadb');

module.exports = async function deleteInstance(
  parent,
  args,
  {user, client, stripe, ssm}
) {
  const instance = await findInstance(client, user, args.id);
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
    // keep checking command status once per second until it's completed
    status = await new Promise(resolve => {
      setTimeout(async () => {
        const data = await ssm
          .getCommandInvocation({
            InstanceId: process.env.AWS_EC2_INSTANCE_ID,
            CommandId: Command.CommandId
          })
          .promise();
        resolve(data.Status);
      }, 1000);
    });
  }

  return client.query(query.Delete(instance.ref));
};

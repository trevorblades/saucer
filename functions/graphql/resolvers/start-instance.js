const {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} = require('apollo-server-lambda');
const {
  createInstanceDomain,
  reduceTags,
  createChangeBatch,
  findInstanceForUser
} = require('../utils');
const {outdent} = require('outdent');

module.exports = async function startInstance(
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

  if (instance.State.Name !== 'stopped') {
    throw new UserInputError('You can only start a stopped instance');
  }

  const subscription = await stripe.subscriptions.create({
    customer: user.data.customerId,
    default_source: args.source,
    items: [{plan: process.env.STRIPE_PLAN_ID_DEV}],
    metadata: {
      instance_id: instance.InstanceId
    }
  });

  const {Name} = reduceTags(instance.Tags);
  const changeBatch = JSON.stringify(
    JSON.stringify(
      createChangeBatch({
        Action: 'UPSERT',
        Name: createInstanceDomain(Name),
        Value: '$ip_address'
      })
    )
  );

  await Promise.all([
    // update user data
    ec2
      .modifyInstanceAttribute({
        InstanceId: instance.InstanceId,
        UserData: {
          Value: outdent`
            Content-Type: multipart/mixed; boundary="//"
            MIME-Version: 1.0

            --//
            Content-Type: text/cloud-config; charset="us-ascii"
            MIME-Version: 1.0
            Content-Transfer-Encoding: 7bit
            Content-Disposition: attachment; filename="cloud-config.txt"

            #cloud-config
            cloud_final_modules:
            - [scripts-user, always]

            --//
            Content-Type: text/x-shellscript; charset="us-ascii"
            MIME-Version: 1.0
            Content-Transfer-Encoding: 7bit
            Content-Disposition: attachment; filename="userdata.txt"

            #!/bin/bash
            ip_address=$(curl 169.254.169.254/latest/meta-data/public-ipv4)
            aws route53 change-resource-record-sets \
              --hosted-zone-id ${process.env.ROUTE_53_HOSTED_ZONE_ID} \
              --change-batch ${changeBatch}
            --//
          `
        }
      })
      .promise(),
    // update subscription tag
    ec2
      .createTags({
        Resources: [instance.InstanceId],
        Tags: [
          {
            Key: 'Subscription',
            Value: subscription.id
          }
        ]
      })
      .promise()
  ]);

  const data = await ec2
    .startInstances({InstanceIds: [instance.InstanceId]})
    .promise();
  return {
    ...instance,
    State: data.StartingInstances[0].CurrentState
  };
};

const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {
  createChangeBatch,
  createInstanceDomain,
  findInstanceForUser,
  reduceTags
} = require('../utils');

const {ROUTE_53_HOSTED_ZONE_ID} = process.env;

module.exports = async function deleteInstance(
  parent,
  args,
  {user, ec2, route53, stripe}
) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const instance = await findInstanceForUser(ec2, user, args.id);
  if (!instance) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  const {customerId} = user.data;
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

  const {Name} = reduceTags(instance.Tags);
  const instanceDomain = createInstanceDomain(Name);
  const StartRecordName = instanceDomain + '.';

  // check for DNS records for this instance
  const {ResourceRecordSets} = await route53
    .listResourceRecordSets({
      HostedZoneId: ROUTE_53_HOSTED_ZONE_ID,
      StartRecordName,
      StartRecordType: 'A',
      MaxItems: '1'
    })
    .promise();

  if (ResourceRecordSets.length) {
    const {Name, ResourceRecords} = ResourceRecordSets[0];
    if (Name === StartRecordName) {
      // clean them up if they exist
      const [{Value}] = ResourceRecords;
      await route53
        .changeResourceRecordSets({
          HostedZoneId: ROUTE_53_HOSTED_ZONE_ID,
          ChangeBatch: createChangeBatch({
            Action: 'DELETE',
            Name: instanceDomain,
            Value
          })
        })
        .promise();
    }
  }

  const {TerminatingInstances} = await ec2
    .terminateInstances({
      InstanceIds: [instance.InstanceId]
    })
    .promise();

  return TerminatingInstances[0].InstanceId;
};

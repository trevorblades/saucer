const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {
  createChangeBatch,
  createInstanceDomain,
  findInstanceForUser
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
      customer: customerId,
      limit: 100
    });

    for (const subscription of data) {
      if (subscription.metadata.instance_id === instance.InstanceId) {
        await stripe.subscriptions.del(subscription.id);
        break;
      }
    }
  }

  const {Name} = instance.Tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.Key]: tag.Value
    }),
    {}
  );

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

  if (
    ResourceRecordSets.length &&
    ResourceRecordSets[0].Name === StartRecordName
  ) {
    // clean them up if they exist
    await route53
      .changeResourceRecordSets({
        HostedZoneId: ROUTE_53_HOSTED_ZONE_ID,
        ChangeBatch: createChangeBatch({
          Action: 'DELETE',
          Name: instanceDomain,
          Value: instance.PublicIpAddress
        })
      })
      .promise();
  }

  const {TerminatingInstances} = await ec2
    .terminateInstances({
      InstanceIds: [instance.InstanceId]
    })
    .promise();

  return TerminatingInstances[0].InstanceId;
};

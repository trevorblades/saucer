const {AuthenticationError, ForbiddenError} = require('apollo-server-lambda');
const {EC2, Route53} = require('aws-sdk');
const {
  createChangeBatch,
  createInstanceDomain,
  findInstancesForUser
} = require('../utils');

module.exports = async function deleteInstance(parent, args, {user}) {
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const [instance] = await findInstancesForUser(user, {
    InstanceIds: [args.id]
  });

  if (!instance) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  const {Name} = instance.Tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.Key]: tag.Value
    }),
    {}
  );

  const route53 = new Route53();
  const instanceDomain = createInstanceDomain(Name);
  const StartRecordName = instanceDomain + '.';

  // check for DNS records for this instance
  const {ResourceRecordSets} = await route53
    .listResourceRecordSets({
      HostedZoneId: process.env.AWS_ROUTE_53_HOSTED_ZONE_ID,
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
        HostedZoneId: process.env.AWS_ROUTE_53_HOSTED_ZONE_ID,
        ChangeBatch: createChangeBatch(
          'DELETE',
          instanceDomain,
          instance.PublicIpAddress
        )
      })
      .promise();
  }

  const ec2 = new EC2();
  const {TerminatingInstances} = await ec2
    .terminateInstances({
      InstanceIds: [instance.InstanceId]
    })
    .promise();

  return TerminatingInstances[0].InstanceId;
};

const {query} = require('faunadb');

exports.paginateInstancesForUser = user =>
  query.Paginate(
    query.Match(query.Index('wp_instances_by_user_id'), user.data.id)
  );

exports.findInstancesForUser = async (client, user) => {
  const {data} = await client.query(
    query.Map(
      query.Paginate(
        query.Match(query.Index('wp_instances_by_user_id'), user.data.id)
      ),
      query.Lambda('X', query.Get(query.Var('X')))
    )
  );

  return data;
};

exports.findInstanceForUser = async (ec2, user, id) => {
  const [instance] = await this.findInstancesForUser(ec2, user, {
    InstanceIds: [id]
  });
  return instance;
};

exports.createChangeBatch = ({Action, Name, Value}) => ({
  Changes: [
    {
      Action,
      ResourceRecordSet: {
        Name,
        ResourceRecords: [{Value}],
        TTL: 300,
        Type: 'A'
      }
    }
  ]
});

exports.createInstanceDomain = subdomain => subdomain + '.saucer.dev';

exports.reduceTags = tags =>
  tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.Key]: tag.Value
    }),
    {}
  );

const {query} = require('faunadb');

exports.paginateInstancesForUser = user =>
  query.Paginate(
    query.Match(query.Index('wp_instances_by_user_id'), user.data.id)
  );

const axios = require('axios');
const jwt = require('jsonwebtoken');
const {parse} = require('querystring');
const {query} = require('faunadb');

function tokenizeResponse(response) {
  return jwt.sign(response.data, process.env.TOKEN_SECRET, {
    subject: response.ref.id
  });
}

module.exports = async function logIn(parent, args, {client}) {
  const accessToken = await axios
    .post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GATSBY_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: args.code
    })
    .then(({data}) => parse(data).access_token);

  const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      authorization: `token ${accessToken}`
    }
  });

  const {id, name} = await githubApi
    .get('/user')
    .then(response => response.data);

  const idString = id.toString();
  const {data} = await client.query(
    query.Paginate(query.Match(query.Index('users_by_id'), idString))
  );

  if (data.length) {
    const [ref] = data;
    const response = await client.query(query.Get(ref));
    return tokenizeResponse(response);
  }

  const [{email}] = await githubApi
    .get('/user/emails')
    .then(({data}) => data.filter(({primary}) => primary));

  const response = await client.query(
    query.Create(query.Collection('users'), {
      data: {
        id: idString,
        name,
        email
      }
    })
  );

  return tokenizeResponse(response);
};

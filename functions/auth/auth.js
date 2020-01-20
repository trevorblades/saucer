const axios = require('axios');
const jwt = require('jsonwebtoken');
const {parse} = require('querystring');
const {Client, query} = require('faunadb');

const {
  NETLIFY_DEV,
  TOKEN_SECRET,
  FAUNADB_SERVER_SECRET,
  GATSBY_GITHUB_CLIENT_ID_PROD,
  GATSBY_GITHUB_CLIENT_ID_DEV,
  GITHUB_CLIENT_SECRET_DEV,
  GITHUB_CLIENT_SECRET_PROD
} = process.env;

const client = new Client({
  secret: FAUNADB_SERVER_SECRET
});

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const {code} = JSON.parse(event.body);
  const accessToken = await axios
    .post('https://github.com/login/oauth/access_token', {
      client_id: NETLIFY_DEV
        ? GATSBY_GITHUB_CLIENT_ID_DEV
        : GATSBY_GITHUB_CLIENT_ID_PROD,
      client_secret: NETLIFY_DEV
        ? GITHUB_CLIENT_SECRET_DEV
        : GITHUB_CLIENT_SECRET_PROD,
      code
    })
    .then(({data}) => {
      const {error, error_description, access_token} = parse(data);
      if (error) {
        throw new Error(error_description);
      }
      return access_token;
    });

  const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      authorization: `token ${accessToken}`
    }
  });

  const {id, name} = await githubApi
    .get('/user')
    .then(response => response.data);

  const {data} = await client.query(
    query.Map(
      query.Paginate(query.Match(query.Index('users_by_id'), id)),
      query.Lambda('X', query.Get(query.Var('X')))
    )
  );

  let user = data[0];
  if (!user) {
    const [{email}] = await githubApi
      .get('/user/emails')
      .then(({data}) => data.filter(({primary}) => primary));

    user = await client.query(
      query.Create(query.Collection('users'), {
        data: {
          id,
          name,
          email
        }
      })
    );
  }

  return {
    statusCode: 200,
    body: jwt.sign(user.data, TOKEN_SECRET, {
      subject: user.ref.id
    })
  };
};

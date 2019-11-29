import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  gql
} from 'apollo-server';
import {Client} from 'ssh2';
import {GraphQLDateTime} from 'graphql-iso-date';
import {User} from './db';
import {parse} from 'querystring';

export const typeDefs = gql`
  scalar DateTime

  type Query {
    instance(id: ID!): Instance
    instances: [Instance]
  }

  type Mutation {
    logIn(code: String!): String
    createInstance(name: String!): Instance
    provisionInstance(id: ID!): Instance
    deleteInstance(id: ID!): Instance
  }

  type Instance {
    id: ID
    name: String
    status: String
    tags: [String]
    createdAt: DateTime
  }
`;

const TAG_STARTED = 'started';
const TAG_READY = 'ready';

const doApi = axios.create({
  baseURL: 'https://api.digitalocean.com/v2',
  headers: {
    Authorization: `Bearer ${process.env.DIGITAL_OCEAN_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function findInstance(id, userId) {
  const response = await doApi.get(`/droplets/${id}`);
  const {droplet} = response.data;
  if (!droplet.tags.includes(userId.toString())) {
    throw new ForbiddenError('You do not have access to this instance');
  }

  return droplet;
}

function tagInstance(id, tag, method = 'post') {
  return doApi.request({
    url: `/tags/${tag}/resources`,
    method,
    data: {
      resources: [
        {
          resource_id: id.toString(),
          resource_type: 'droplet'
        }
      ]
    }
  });
}

async function listDomainRecords() {
  const response = await doApi.get('/domains/saucer.dev/records');
  return response.data.domain_records;
}

export const resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    createdAt: instance => instance.created_at
  },
  Query: {
    instance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      return findInstance(args.id, user.id);
    },
    async instances(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const response = await doApi.get('/droplets', {
        params: {
          tag_name: user.id
        }
      });

      return response.data.droplets;
    }
  },
  Mutation: {
    async logIn(parent, args) {
      const accessToken = await axios
        .post('https://github.com/login/oauth/access_token', {
          client_id: process.env.GITHUB_CLIENT_ID,
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

      let user = await User.findByPk(id);
      if (!user) {
        const [{email}] = await githubApi
          .get('/user/emails')
          .then(({data}) => data.filter(({primary}) => primary));

        user = await User.create({
          id,
          name,
          email
        });
      }

      return jwt.sign(user.get(), process.env.TOKEN_SECRET);
    },
    async createInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      try {
        const response = await doApi.post('/droplets', {
          name: args.name,
          region: 'sfo2',
          size: 's-1vcpu-1gb',
          image: 'wordpress-18-04',
          tags: [user.id.toString()],
          ssh_keys: [process.env.SSH_KEY_FINGERPRINT]
        });

        return response.data.droplet;
      } catch (error) {
        throw new UserInputError(error);
      }
    },
    async provisionInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const droplet = await findInstance(args.id, user.id);
      if (droplet.status !== 'active') {
        throw new UserInputError('Instance is not ready to provision');
      }

      if (droplet.tags.includes(TAG_READY)) {
        throw new UserInputError('Instance is already provisioned');
      }

      // if (droplet.tags.includes(TAG_STARTED)) {
      //   throw new UserInputError('Instance is currently being provisioned');
      // }

      if (!droplet.tags.includes(TAG_STARTED)) {
        await tagInstance(droplet.id, TAG_STARTED);
      }

      let isDomainConfigured = false;
      const domainRecords = await listDomainRecords();
      for (const record of domainRecords) {
        if (record.name === droplet.name) {
          isDomainConfigured = true;
          break;
        }
      }

      const [{ip_address}] = droplet.networks.v4;
      if (!isDomainConfigured) {
        await doApi.post('/domains/saucer.dev/records', {
          type: 'A',
          name: droplet.name,
          data: ip_address
        });
      }

      const conn = await new Promise((resolve, reject) => {
        const client = new Client();
        client
          .on('ready', () => {
            resolve(client);
          })
          .on('error', reject)
          .connect({
            host: ip_address,
            username: 'root',
            privateKey: process.env.PRIVATE_KEY
          });
      });

      // const cmd = [
      //   `${droplet.name}.saucer.dev`, // host
      //   'hello@saucer.dev', // email
      //   'admin', // username
      //   'password', // password
      //   'test', // blog title
      //   'y', // letsencrypt
      //   'ssl@saucer.dev', // email
      //   'A', // agree
      //   'N', // subscribe to newsletter
      //   '1', // only subdomain or www?
      //   '2' // redirect HTTP to HTTPS
      // ].join('\r');

      const {out, err} = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        conn.shell((err, stream) => {
          if (err) {
            reject(err);
          }

          stream
            .on('close', (code, signal) => {
              resolve({
                out: stdout,
                err: stderr,
                code,
                signal
              });
            })
            .on('data', data => {
              stdout += data;

              if (/Domain\/Subdomain name:\s$/.test(data)) {
                stream.end(`${droplet.name}.saucer.dev\r`);
              }

              if (/Your Email Address:\s$/.test(data)) {
                stream.close();
              }
            })
            .stderr.on('data', data => {
              stderr += data;
            });
        });
      });

      console.log('OUT:', out);
      console.log('ERR:', err);

      return droplet;
    },
    async deleteInstance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const droplet = await findInstance(args.id, user.id);
      await doApi.delete(`/droplets/${droplet.id}`);

      const domainRecords = await listDomainRecords();
      await Promise.all(
        domainRecords
          .filter(record => record.name === droplet.name)
          .map(record =>
            doApi.delete(`/domains/saucer.dev/records/${record.id}`)
          )
      );

      return droplet;
    }
  }
};

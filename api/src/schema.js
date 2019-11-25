import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  gql
} from 'apollo-server';
import {Client} from 'ssh2';
import {User} from './db';
import {parse} from 'querystring';

const doApi = axios.create({
  baseURL: 'https://api.digitalocean.com/v2',
  headers: {
    Authorization: `Bearer ${process.env.DIGITAL_OCEAN_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const TAG_STARTED = 'started';
const TAG_READY = 'ready';

async function findInstance(id, userId) {
  const response = await doApi.get(`/droplets/${id}`);
  const {droplet} = response.data;
  if (!droplet.tags.includes(userId.toString())) {
    throw new ForbiddenError('You do not have access to this resource');
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

export const typeDefs = gql`
  type Query {
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
  }
`;

export const resolvers = {
  Query: {
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

      if (!droplet.tags.includes(TAG_STARTED)) {
        await tagInstance(droplet.id, TAG_STARTED);
      }

      const [{ip_address}] = droplet.networks.v4;

      let isDomainConfigured = false;
      const domainRecords = await listDomainRecords();
      for (const record of domainRecords) {
        if (record.name === droplet.name) {
          isDomainConfigured = true;
          break;
        }
      }

      if (!isDomainConfigured) {
        await doApi.post('/domains/saucer.dev/records', {
          type: 'A',
          name: droplet.name,
          data: ip_address
        });
      }

      const conn = new Client();
      conn
        .on('ready', () => {
          conn.shell((err, stream) => {
            if (err) {
              throw err;
            }

            stream
              .on('close', () => {
                console.log('end here');
                conn.end();
              })
              .on('end', () => {
                console.log('ended??');
              })
              .on('data', data => {
                console.log(data.toString());
              });
            stream.end(
              [
                `${droplet.name}.saucer.dev`,
                'hello@saucer.dev',
                'admin',
                'password',
                'test',
                'y',
                'ssl@saucer.dev',
                'A',
                'N',
                '1',
                '2'
              ].join('\r')
            );
          });
        })
        .on('error', error => {
          console.log(error);
        })
        .connect({
          host: ip_address,
          username: 'root',
          privateKey: process.env.PRIVATE_KEY
        });

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

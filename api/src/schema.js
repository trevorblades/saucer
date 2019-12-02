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
    provisionInstance(
      id: ID!
      email: String!
      username: String!
      password: String!
      title: String!
    ): Instance
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

const TAG_READY = 'ready';
const TAG_STARTED = 'started';
const TAG_PROVISIONED = 'provisioned';

const PLUGINS_DIR = '/var/www/html/wp-content/plugins';

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

function createConnection(host) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client
      .on('ready', () => {
        resolve(client);
      })
      .on('error', reject)
      .connect({
        host,
        username: 'root',
        privateKey: process.env.PRIVATE_KEY
      });
  });
}

export const resolvers = {
  DateTime: GraphQLDateTime,
  Instance: {
    createdAt: instance => instance.created_at
  },
  Query: {
    async instance(parent, args, {user}) {
      if (!user) {
        throw new AuthenticationError('Unauthorized');
      }

      const droplet = await findInstance(args.id, user.id);
      if (droplet.status === 'active' && !droplet.tags.includes(TAG_READY)) {
        try {
          // test SSH connection to the droplet
          const [{ip_address}] = droplet.networks.v4;
          const conn = await createConnection(ip_address);
          conn.end();

          // tag with 'ready' if connection is successful
          await tagInstance(droplet.id, TAG_READY);
          return findInstance(droplet.id, user.id);
        } catch (error) {
          // let errors pass
        }
      }

      return droplet;
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
      if (droplet.status !== 'active' || !droplet.tags.includes(TAG_READY)) {
        throw new UserInputError('Instance is not ready to provision');
      }

      if (droplet.tags.includes(TAG_PROVISIONED)) {
        throw new UserInputError('Instance is already provisioned');
      }

      if (droplet.tags.includes(TAG_STARTED)) {
        throw new UserInputError('Instance is currently being provisioned');
      }

      await tagInstance(droplet.id, TAG_STARTED);

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

      const conn = await createConnection(ip_address);
      conn.shell((err, stream) => {
        if (err) {
          throw new Error(err);
        }

        stream
          .on('close', () => {
            // TODO: do something
          })
          .on('data', data => {
            // TODO: send console data back to sub
            // filter events on the instance id

            const message = data.toString();
            const parts = message.split('\n').filter(Boolean);
            const lastPart = parts[parts.length - 1];

            switch (lastPart.trim()) {
              case 'Domain/Subdomain name:':
                stream.write(`${droplet.name}.saucer.dev\r`);
                break;
              case 'Your Email Address:':
                stream.write(`${args.email}\r`);
                break;
              case 'Username:':
                stream.write(`${args.username}\r`);
                break;
              case 'Password:':
                stream.write(`${args.password}\r`);
                break;
              case 'Blog Title:':
                stream.write(`${args.title}\r`);
                break;
              case 'Would you like to use LetsEncrypt (certbot) to configure SSL(https) for your new site? (y/n):':
                stream.write('y\r');
                break;
              // Enter email address (used for urgent renewal and security notices) (Enter 'c' to
              case 'cancel):':
                stream.write('ssl@saucer.dev\r');
                break;
              // Please read the Terms of Service at
              // https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
              // agree in order to register with the ACME server at
              // https://acme-v02.api.letsencrypt.org/directory
              case '(A)gree/(C)ancel:':
                stream.write('A\r');
                break;
              // Would you be willing to share your email address with the Electronic Frontier
              // Foundation, a founding partner of the Let's Encrypt project and the non-profit
              // organization that develops Certbot? We'd like to send you email about our work
              // encrypting the web, EFF news, campaigns, and ways to support digital freedom.
              case '(Y)es/(N)o:':
                stream.write('N\r');
                break;
              // Which names would you like to activate HTTPS for?
              // 1: DROPLET_NAME.saucer.dev
              // 2: www.DROPLET_NAME.saucer.dev
              // Select the appropriate numbers separated by commas and/or spaces, or leave input
              case "blank to select all options shown (Enter 'c' to cancel):":
                stream.write('1\r');
                break;
              // Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
              // 1: No redirect - Make no further changes to the webserver configuration.
              // 2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
              // new sites, or if you're confident your site works on HTTPS. You can undo this
              // change by editing your web server's configuration.
              case "Select the appropriate number [1-2] then [enter] (press 'c' to cancel):":
                stream.write('2\r');
                break;
              // Installation complete. Access your new WordPress site in a browser to continue.
              case `root@${droplet.name}:~#`:
                // install graphql plugins and enable pretty permalinks
                stream.end(
                  [
                    `cd ${PLUGINS_DIR}`,
                    'git clone https://github.com/wp-graphql/wp-graphql',
                    'git clone https://github.com/wp-graphql/wp-graphiql',
                    'wp plugin activate wp-graphql wp-graphiql --allow-root',
                    "wp rewrite structure '/%year%/%monthnum%/%postname%/' --allow-root"
                  ].join(' && ') + '\r'
                );
                break;
              case `root@${droplet.name}:${PLUGINS_DIR}#`:
                stream.close();
                break;
              default:
            }
          })
          .stderr.on('data', data => {
            throw new Error(data);
          });
      });

      return findInstance(droplet.id, user.id);

      // remove 'started' and 'ready' tags, and add a 'provisioned' one
      await Promise.all([
        tagInstance(droplet.id, TAG_PROVISIONED),
        tagInstance(droplet.id, TAG_STARTED, 'delete'),
        tagInstance(droplet.id, TAG_READY, 'delete')
      ]);

      // refetch droplet
      return findInstance(droplet.id, user.id);
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

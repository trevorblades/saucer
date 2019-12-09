# Saucer

Headless Wordpress and GraphQL in one click

## Development

Before running the site locally, make sure you have [the Netlify CLI](https://cli.netlify.com) installed.

```bash
npm install -g netlify-cli # if necessary
npm install # install project dependencies
npx netlify-lambda install # install function dependencies
netlify link # link local dev environment to netlify site (env vars)
netlify dev # run the client and lambda functions
```

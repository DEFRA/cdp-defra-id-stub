# CDP Node.js Frontend Template

Core delivery platform Node.js Frontend Template.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Redis](#redis)
- [Server-side Caching](#server-side-caching)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Local JSON API](#local-json-api)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd cdp-node-frontend-template
nvm use
```

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

Redis has been **disabled** in newly created services by setting the `redis.enabled` property to `false`. The CDP platform team have to inject Redis configuration into your service first. Your service will death-loop if Redis is enabled without speaking to us first.

> [!IMPORTANT]
> If enabling Redis, contact the CDP Platform Team first. Deploying your service with Redis enabled, before we've injected Redis configuration will cause your service to death-loop.

## Server-side Caching

We use Catbox for server-side caching. Specifically CatboxRedis, the Redis adapter for CatBox. It is important that in memory caching isn't used for server-side caching as this will cause issues when there is more than one instance of your service running. Server-side caching has been **disabled** in newly created services by setting the `redis.enabled` property to `false`. Please see [Redis](#redis) for more information.

> [!IMPORTANT]
> If you want to enable server-side caching using Catbox, contact the CDP Platform Team first. Deploying your service with Redis enabled, before we've injected Redis configuration will cause your service to death-loop.

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

### Local JSON API

Whilst the APIs are being developed this app uses a local JSON mock API. To start this locally run:

```bash
npm run mockApi
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

## Docker

### Development image

Build:

```bash
docker build --target development --no-cache --tag cdp-node-frontend-template:development .
```

Run:

```bash
docker run -p 3000:3000 cdp-node-frontend-template:development
```

### Production image

Build:

```bash
docker build --no-cache --tag cdp-node-frontend-template .
```

Run:

```bash
docker run -p 3000:3000 cdp-node-frontend-template
```

### Docker Compose

A local environment with:

- Localstack for AWS services (S3, SQS)
- Redis
- MongoDB
- This service.
- A commented out backend example.

```bash
docker compose up --build -d
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

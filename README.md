# CDP DEFRA ID Stub

A service to stub out the real DEFRA ID service.

- [Purpose](#purpose)
- [Local Development](#local-development)
  - [Requirement](#requirement)
    - [Node](#node)
    - [Docker Compose](#docker-compose)
  - [Setup](#setup)
  - [Test](#test)
  - [Running](#running)
    - [Directly](#directly)
    - [Docker Compose](#docker-compose)
- [Integrate](#integrate)
- [DEFRA ID](#defra-id)
  - [Onboarding](#onboarding)
  - [DEFRA ID Stub](#defra-id-stub)
  - [DEMO](#demo)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

---

## Purpose

Allows simulating an integraton with DEFRA ID authentication.

Intended use in development and automated testing.
Available as docker image and in lower CDP environments.

It is encouraged to integrate with the real DEFRA ID for staging integration.

Note: DEFRA ID is not made by CDP.

---

## Local Development

### Requirements

#### Node

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd cdp-defra-id-stub
nvm use
```

### Docker Compose

Installing Docker and Docker Compose locally is not required but may be desired for local development.

- https://docs.docker.com/compose/install/

### Setup

Install application dependencies:

```bash
npm install
```

---

### Test

Test continously:

```bash
npm run test:watch
```

---

## Running

### Directly

To run the application in `development` mode run:

```bash
npm run dev
```

### Docker Compose

A local environment is provided with:

- Redis
- CDP DEFRA ID stub

```bash
docker compose up --build -d
```

## Integrating

More details to come

To integrate locally, see [running](#running) above).stub.infra-dev.cdp-int.defra.cloud/cdp-defra-id-stub/.well-known/openid-configuration'

### OIDC URL

To integrate in an environment, configure your app's **OIDC Configuration URL** to be one of:

- Local: `http://localhost:3200/cdp-defra-id-stub/.well-known/openid-configuration`
- Dev: `https://cdp-defra-id-stub.dev.cdp-int.defra.cloud/cdp-defra-id-stub/.well-known/openid-configuration`
- Test: `https://cdp-defra-id-stub.test.cdp-int.defra.cloud/cdp-defra-id-stub/.well-known/openid-configuration`
- Perf test: `https://cdp-defra-id-stub.perf-test.cdp-int.defra.cloud/cdp-defra-id-stub/.well-known/openid-configuration`

### Client secret

(This will change soon)

Set the **DEFRA ID Client Secret** to `test_value`

---

## DEFRA ID

For more information on DEFRA ID

### DEFRA ID Onboarding

- https://dev.azure.com/defragovuk/DEFRA-Common-Platform-Improvements/_wiki/wikis/DEFRA-Common-Platform-Improvements.wiki/3115/Technical-onboarding-guide-for-core-service#

### DEFRA ID Stub

The DEFRA ID team also offers a DEFRA ID stub you can integrate with.
It may be more up to date.
And may offer more features.

- https://dev.azure.com/defragovuk/DEFRA-Common-Platform-Improvements/_wiki/wikis/

### Demo

A CDP demo app integrating with DEFRA ID

- https://cdp-defra-id-demo.test.cdp-int.defra.cloud/cdp-defra-id-demo
- https://github.com/DEFRA/cdp-defra-id-demo

---

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

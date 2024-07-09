# CDP DEFRA ID Stub

A service to stub out the real DEFRA ID service.

- [Purpose](#purpose)
- [Local Development](#local-development)
  - [Requirements](#requirements)
    - [Node](#node)
    - [Docker Compose](#docker-compose)
  - [Setup](#setup)
  - [Test](#test)
  - [Running](#running)
    - [Directly](#directly)
    - [Docker Compose](#docker-compose)
- [Integrate](#integrate)
- [Registration](#registration)
- [API](#api)
- [DEFRA ID](#defra-id)
  - [DEFRA ID Onboarding](#defra-id-onboarding)
  - [DEFRA ID Stub](#defra-id-stub)
  - [DEFRA ID Demo](#defra-id-demo)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

---

## Purpose

Allows simulating an integration with DEFRA ID authentication.

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

Test continuously:

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

## Integrate

To integrate locally, see [running](#running) above).

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

## Registration

You can register for a temporary ID and login at:

- Dev: `https://cdp-defra-id-stub.dev.cdp-int.defra.cloud`
- Test: `https://cdp-defra-id-stub.test.cdp-int.defra.cloud`
- Perf test: `https://cdp-defra-id-stub.perf-test.cdp-int.defra.cloud`

## API

You create, find and expire a temporary ID via the API

### Register

With an example **payload.json**:

```json
{
  "userId": "86a7607c-a1e7-41e5-a0b6-a41680d05a2a",
  "email": "some@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "loa": "1",
  "aal": "1",
  "enrolmentCount": 1,
  "enrolmentRequestCount": 1,
  "relationships": [
    {
      "organisationName": "Some Org",
      "relationshipRole": "Employee",
      "roleName": "Some role",
      "roleStatus": "1"
    }
  ]
}
```

```bash
curl -H "Content-Type: application/json" -X POST -d @payload.json https://cdp-defra-id-stub.dev.cdp-int.defra.cloud/cdp-defra-id-stub/API/register
```

### Find

```bash
curl https://cdp-defra-id-stub.dev.cdp-int.defra.cloud/cdp-defra-id-stub/API/register/86a7607c-a1e7-41e5-a0b6-a41680d05a2a
```

### Expire

```bash
curl -H "Content-Type: application/json" -X POST https://cdp-defra-id-stub.dev.cdp-int.defra.cloud/cdp-defra-id-stub/API/register/86a7607c-a1e7-41e5-a0b6-a41680d05a2a6/expire
```

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

### DEFRA ID Demo

A CDP demo app integrating with DEFRA ID.
Works with both CDP stub and the DEFRA ID's own stub.

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

![Build status](https://github.com/tbhanson96/homeserver-v2/actions/workflows/build.yml/badge.svg)

# homeserver-v2

Personal homeserver application built with NestJS and Angular.

## Project Structure

This repository is organized as a small monorepo:

- `server/`: NestJS backend API, business logic, Swagger generation, and server-side tests
- `client/`: Angular frontend, generated API client, and UI assets
- `scripts/`: root-level development helpers for running the stack and starting the local database
- `mock/`: sample mounted content used by the app and Docker runs

## Main Features

The app is structured around a few core domains:

- authentication
- file browsing and uploads
- ebooks and Calibre integration
- torrent management
- settings and update flows
- health and status reporting

## Requirements

- Node.js version from `.nvmrc`
- npm
- MongoDB or Podman/Docker for a local database

Optional:

- Calibre, if ebook features are configured to use it
- Docker, for container builds and deployment

## Installation

Install dependencies separately for the server and client:

```bash
cd server && npm install
cd ../client && npm install
cd ..
```

## Development

### Run the full stack in watch mode

```bash
npm run start:watch
```

This starts:

- the NestJS server in watch mode
- the Angular client build in watch mode
- Swagger regeneration and client API code generation after the server starts

### Start the local database

```bash
npm run start:db
```

This helper starts a MongoDB container using Podman and ports/volumes from the server config.

### Run apps independently

Backend:

```bash
cd server
npm run start:watch
```

Frontend:

```bash
cd client
npm start
```

## Build

Build everything:

```bash
npm run build
```

Build only the backend:

```bash
npm run build:server
```

Build only the frontend:

```bash
npm run build:client
```

Production build:

```bash
npm run build:prod
```

## Testing

Server tests:

```bash
cd server
npm test
```

Note: run server tests outside the sandbox in this repository. Some e2e tests bind a local listener and can fail under sandbox restrictions with `listen EPERM` or null `supertest` port errors even when the tests are otherwise valid.

## Docker

Build the container image:

```bash
npm run docker:build
```

Run the image locally:

```bash
npm run docker:start
```

Run the image with Node inspector enabled:

```bash
npm run docker:debug
```

Tag and push for deployment:

```bash
npm run docker:tag
npm run docker:push
```

Or use:

```bash
npm run deploy
```

## CI

GitHub Actions in `.github/workflows/build.yml` currently:

- installs dependencies for `server/` and `client/`
- builds the server
- builds the production client
- runs the server test suite
- builds and pushes the container image on `master`

## Notes

- The root scripts coordinate the two subprojects, but each app keeps its own `package.json`.
- The Angular client uses generated API bindings from the backend Swagger document.
- The root `start` script expects a built server entry file.

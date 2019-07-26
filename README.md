# push-experiments

This repo is a simple example of [Web Push](https://tools.ietf.org/html/rfc8030) using service worker and a simple NodeJS server.

## How to

Install dependencies
```
npm i
```
You will need to get VAPID keys before starting, because Web Push require [message encryption](https://tools.ietf.org/html/rfc8291)

```
npm run generate-keys
```
This will generate a `.env` with keys inside (VAPID_PUBLIC, VAPID_PRIVATE).

Run server :

```
npm run server
```

### Directory structure

```
|
|--- public
|--- scripts
|--- server

```

#### Public folder

Regroup all files serve with a simple http server. This is where you
receive notifications and register ServiceWorker.

#### Scripts folder

Simple node script to generate VAPID keys.

#### Server folder

Express server to register device and send notification to Push Service.


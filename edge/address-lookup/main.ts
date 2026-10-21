// Bunny Edge Scripting entry. Bundled by scripts/edge/build-address-lookup.mjs.
import * as BunnySDK from '@bunny.net/edgescript-sdk';
import process from 'node:process';
import { configFromEnv } from './config';
import { createAddressHandler } from './handler';

const handle = createAddressHandler(configFromEnv(name => process.env[name]), {
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
  log: line => console.log(line),
});

BunnySDK.net.http.serve(handle);

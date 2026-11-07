import * as BunnySDK from '@bunny.net/edgescript-sdk';
import process from 'node:process';
import { createProbeHandler } from './probe-handler.mjs';

BunnySDK.net.http.serve(createProbeHandler({
  key: process.env.DIAGNOSTIC_KEY,
  expiresAt: Number(process.env.DIAGNOSTIC_EXPIRES_AT),
  fetch: (url, init) => fetch(url, init),
}));

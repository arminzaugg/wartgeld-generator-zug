// Pure helpers for uploading the built site to Bunny Storage.

const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  json: 'application/json',
  webmanifest: 'application/manifest+json',
  txt: 'text/plain; charset=utf-8',
};

/** Content type sent with an uploaded file; Bunny serves it back with this type. */
export const contentTypeFor = path => CONTENT_TYPES[path.split('.').pop().toLowerCase()] ?? 'application/octet-stream';

/** Upload order: hidden files skipped, index.html last so it never points at assets not yet uploaded. */
export const uploadOrder = paths => {
  const visible = paths.filter(path => !path.split('/').some(part => part.startsWith('.')));
  return [...visible.filter(path => path !== 'index.html').sort(), ...visible.filter(path => path === 'index.html')];
};

/** The bundle a built index.html loads, used to confirm the live page is the new build. */
export const entryScriptOf = html => html.match(/<script[^>]*\ssrc="(\/assets\/[^"]+\.js)"/)?.[1] ?? null;

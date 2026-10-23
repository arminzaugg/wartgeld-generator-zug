import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin, type ViteDevServer } from "vite";

type Handler = (request: Request) => Promise<Response>;

/** Loads the edge handler through Vite so it shares the app's module graph and aliases. */
const loadHandler = async (server: ViteDevServer, env: Record<string, string>): Promise<Handler> => {
  const [{ createAddressHandler }, { configFromEnv }] = await Promise.all([
    server.ssrLoadModule("/edge/address-lookup/handler.ts"),
    server.ssrLoadModule("/edge/address-lookup/config.ts"),
  ]);
  return createAddressHandler(configFromEnv((name: string) => env[name]), {
    fetch: (input: Parameters<typeof fetch>[0], init?: RequestInit) => fetch(input, init),
    now: () => Date.now(),
    log: (line: string) => server.config.logger.info(line),
  });
};

/** Rejects DNS-rebinding pages, which reach loopback under a foreign Host name. */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const isLoopback = (address: string | undefined) =>
  address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";

const toRequest = async (req: IncomingMessage): Promise<Request> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(name, value);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const path = (req as IncomingMessage & { originalUrl?: string }).originalUrl ?? req.url;
  return new Request(`http://${req.headers.host}${path}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
};

const send = async (response: Response, res: ServerResponse) => {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
};

/**
 * Serves `/api/address` during `npm run dev` from the same handler that runs on
 * Bunny. Only the POST_APIM_* values of `.env.local` are read, server side.
 * Off under Playwright (E2E=1): end-to-end tests stub the lookup instead.
 */
export const devAddressLookup = (mode: string): Plugin => ({
  name: "dev-address-lookup",
  apply: "serve",
  configureServer(server) {
    if (process.env.E2E === "1") return;
    const env = loadEnv(mode, server.config.root, "POST_APIM_");
    let handler: Promise<Handler> | undefined;
    server.middlewares.use("/api/address", (req, res, next) => {
      // The dev server listens on all interfaces; only this machine may spend the Post credentials.
      if (!isLoopback(req.socket.remoteAddress) || !LOCAL_HOST.test(req.headers.host ?? "")) {
        res.statusCode = 403;
        res.end();
        return;
      }
      handler ??= loadHandler(server, env);
      handler
        .then(async handle => send(await handle(await toRequest(req)), res))
        .catch(error => {
          handler = undefined; // load again on the next request
          next(error);
        });
    });
  },
});

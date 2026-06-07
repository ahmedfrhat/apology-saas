import { handle } from '@hono/node-server/vercel';

// ---------------------------------------------------------------------------
// Vercel Serverless Entry Point
//
// Imports the pre-built server bundle and wraps it with the Vercel adapter.
// The build output's default export is the Hono app returned by
// createHonoServer(). Even though createHonoServer calls serve() internally,
// the serve() call will be a no-op / fail silently on Vercel — the actual
// request handling is done through the handle() adapter below.
// ---------------------------------------------------------------------------

let appPromise = null;

async function getApp() {
  if (appPromise) return appPromise;

  appPromise = (async () => {
    // Dynamically import the server bundle.
    try {
      const mod = await import('../build/server/index.js');
      return mod.default;
    } catch (err) {
      console.error('[vercel] Error importing server bundle:', err);
      throw err;
    }
  })();

  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return handle(app)(req, res);
}

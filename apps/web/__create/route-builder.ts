import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// ---------------------------------------------------------------------------
// Use Vite's import.meta.glob to statically discover all API route files at
// compile time. This replaces the old runtime fs.readdir approach which crashed
// on Vercel (ENOENT) because the source directory structure doesn't exist in
// the production bundle.
// ---------------------------------------------------------------------------

// Eagerly import all route modules so they're available synchronously.
const routeModules: Record<string, Record<string, unknown>> = import.meta.glob(
  '../src/app/api/**/route.js',
  { eager: true },
) as Record<string, Record<string, unknown>>;

// Helper: convert a glob key like "../src/app/api/sites/[slug]/route.js"
// into a Hono-compatible path like "/sites/:slug".
function globKeyToHonoPath(key: string): string {
  // Strip the leading prefix and trailing "/route.js"
  const stripped = key
    .replace(/^\.\.\/src\/app\/api/, '')
    .replace(/\/route\.js$/, '');

  if (!stripped || stripped === '/') return '/';

  const segments = stripped.split('/').filter(Boolean);

  const transformed = segments.map((segment) => {
    const match = segment.match(/^\[(\.\.\.)?(.*)\]$/);
    if (match) {
      const [, dots, param] = match;
      return dots ? `:${param}{.+}` : `:${param}`;
    }
    return segment;
  });

  return `/${transformed.join('/')}`;
}

// Sort routes so that more specific (longer) paths are registered first.
const sortedKeys = Object.keys(routeModules)
  .slice()
  .sort((a, b) => b.length - a.length);

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

for (const key of sortedKeys) {
  const routeModule = routeModules[key];
  const honoPath = globKeyToHonoPath(key);

  for (const method of HTTP_METHODS) {
    if (typeof routeModule[method] !== 'function') continue;

    const handler: Handler = async (c) => {
      const params = c.req.param();

      // In dev mode, re-import the module to pick up HMR changes.
      if (import.meta.env.DEV) {
        const freshModules: Record<string, Record<string, unknown>> =
          import.meta.glob('../src/app/api/**/route.js', {
            eager: true,
          }) as Record<string, Record<string, unknown>>;
        const freshModule = freshModules[key];
        if (freshModule && typeof freshModule[method] === 'function') {
          return await (freshModule[method] as Function)(c.req.raw, { params });
        }
      }

      return await (routeModule[method] as Function)(c.req.raw, { params });
    };

    const m = method.toLowerCase();
    switch (m) {
      case 'get':
        api.get(honoPath, handler);
        break;
      case 'post':
        api.post(honoPath, handler);
        break;
      case 'put':
        api.put(honoPath, handler);
        break;
      case 'delete':
        api.delete(honoPath, handler);
        break;
      case 'patch':
        api.patch(honoPath, handler);
        break;
    }
  }
}

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      import.meta.hot?.invalidate();
    });
  }
}

export { api, API_BASENAME };

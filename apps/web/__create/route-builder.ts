import { Hono } from 'hono';
import type { Handler } from 'hono/types';

const API_BASENAME = '/api';
const api = new Hono();

const routeModules: Record<string, Record<string, unknown>> = import.meta.glob(
  '../src/app/api/**/route.js',
  { eager: true },
) as Record<string, Record<string, unknown>>;

function globKeyToHonoPath(key: string): string {
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

const sortedKeys = Object.keys(routeModules).sort((a, b) => b.length - a.length);

for (const key of sortedKeys) {
  const routeModule = routeModules[key];
  const honoPath = globKeyToHonoPath(key);

  for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
    if (typeof routeModule[method] !== 'function') continue;
    const handler: Handler = async (c) => {
      const params = c.req.param();
      return await (routeModule[method] as Function)(c.req.raw, { params }, c);
    };
    (api as any)[method.toLowerCase()](honoPath, handler);
  }
}

export { api, API_BASENAME };

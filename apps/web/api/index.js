import { handle } from '@hono/node-server/vercel';

let handler;

export default async function(req, res) {
  if (!handler) {
    const module = await import('../build/server/index.js');
    const app = module.default;
    handler = handle(app);
  }
  return handler(req, res);
}

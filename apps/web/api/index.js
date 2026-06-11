import { handle } from '@hono/node-server/vercel';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let handler;

export default async function(req, res) {
  if (!handler) {
    const serverBuildPath = path.resolve(process.cwd(), 'build/server/index.js');
    const module = await import(pathToFileURL(serverBuildPath).href);
    const app = module.default;
    handler = handle(app);
  }
  return handler(req, res);
}


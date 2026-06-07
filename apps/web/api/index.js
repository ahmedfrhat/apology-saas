import { handle } from '@hono/node-server/vercel';
import app from '../build/server/index.js';

// ---------------------------------------------------------------------------
// Vercel Serverless Entry Point
//
// Wraps the pre-built Hono server bundle with the Vercel adapter.
// We use a static import here so that Vercel's `@vercel/node` bundler can 
// statically trace dependencies (hono, react-router, pg, etc.) and include 
// them in the lambda package.
//
// The dynamically imported React Router chunks (page modules) are explicitly 
// included via `includeFiles` in vercel.json.
// ---------------------------------------------------------------------------

export default function handler(req, res) {
  return handle(app)(req, res);
}

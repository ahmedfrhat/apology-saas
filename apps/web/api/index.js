// Vercel Serverless Function Entry Point
//
// This file wraps the pre-built Hono app (which includes all custom middleware
// from __create/index.ts plus the React Router SSR handler) with Vercel's
// node adapter so it can run as a serverless function.
//
// The app is built by `react-router build` and lives in:
//   build/server/index.js  → re-exports from build/server/assets/index-*.js
//
// `@hono/node-server/vercel` converts a Hono app into a standard
// Vercel-compatible (req, res) handler.

import { handle } from '@hono/node-server/vercel';
import app from '../build/server/index.js';

export default handle(app);

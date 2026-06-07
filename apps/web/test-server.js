import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './__create/index.js'; // Adjust path if needed

console.log("Starting server...");
serve({
  fetch: app.fetch,
  port: 4000
}, () => {
  console.log("Server listening on port 4000");
});

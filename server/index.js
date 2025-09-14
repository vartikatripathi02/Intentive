// Local entrypoint for the Express server.
//
// When running locally (e.g. during development), this file imports the
// Express app from app.js and starts listening on the configured port. In
// Vercel, the Express app is imported and exported from api/index.js and this
// file is ignored.

const { app, PORT } = require('./app');

// Only start the server if not running in a serverless environment (e.g., Vercel).
// Vercel sets process.env.VERCEL to '1'.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server listening at http://localhost:${PORT}`);
  });
}
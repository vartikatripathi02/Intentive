/*
 * Vercel serverless entrypoint for the Express app.
 *
 * This module imports the Express app from the server/app.js file and
 * exports it. Vercel automatically detects files inside the api/
 * directory and treats them as serverless functions. The rewrite
 * configuration in vercel.json ensures that all incoming requests are
 * forwarded to this function, allowing the Express app to handle both
 * API routes and serving static files.
 */

const { app } = require('../server/app');

module.exports = app;
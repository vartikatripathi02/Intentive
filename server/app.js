// Express app that supports BOTH Gemini (Google) and OpenAI.
// Exports { app, PORT } for local dev and Vercel serverless.
// Works locally with `npm start`, and in Vercel via api/index.js.

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// API keys from environment variables. If both exist, Google is preferred.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Node 18+ provides a global fetch. For older environments, lazily import node-fetch.
let _fetch = global.fetch;
if (!_fetch) {
  _fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

// Use CORS and JSON parsing middleware. Body parsing is built into Express 4.18+.
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ----------------------------
// AI Provider helper functions
// ----------------------------

/**
 * Invoke the Google Gemini API using the generative language endpoint.
 * Converts ChatGPT-like { role, content } messages into Gemini's content format.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{ role: string, content: string }>}
 */
async function callGemini(messages) {
  const model = 'models/gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GOOGLE_API_KEY}`;

  // Map ChatGPT roles to Gemini roles. Gemini expects 'user' and 'model'.
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }],
  }));

  const res = await _fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '(no content)';
  return { role: 'assistant', content: text };
}

/**
 * Invoke the OpenAI Chat Completion API via HTTP. This function uses fetch
 * instead of the openai SDK to avoid extra dependencies. See
 * https://platform.openai.com/docs/api-reference/chat/create for details.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{ role: string, content: string }>}
 */
async function callOpenAI(messages) {
  const res = await _fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.2,
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  return data.choices[0].message;
}

// ----------------------------
// API Routes
// ----------------------------

/** Health check endpoint. Returns server info and which provider is configured. */
app.get('/api/health', (_req, res) => {
  return res.json({
    ok: true,
    provider: GOOGLE_API_KEY
      ? 'google'
      : OPENAI_API_KEY
      ? 'openai'
      : 'none',
    node: process.versions.node,
  });
});

/**
 * Chat endpoint. Accepts { messages: [...] } in the body.
 * Prefers Google Gemini when GOOGLE_API_KEY is set. Otherwise uses OpenAI.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Body must include messages: []' });
    }
    // Prefer Gemini if configured
    if (GOOGLE_API_KEY || String(GOOGLE_API_KEY).startsWith('AIza')) {
      const reply = await callGemini(messages);
      return res.json({ message: reply, provider: 'google' });
    }
    // Then prefer OpenAI
    if (OPENAI_API_KEY) {
      const reply = await callOpenAI(messages);
      return res.json({ message: reply, provider: 'openai' });
    }
    // Fallback when no keys configured
    return res.json({
      message: {
        role: 'assistant',
        content:
          'No AI provider configured. Set GOOGLE_API_KEY (Gemini) or OPENAI_API_KEY on the server.',
      },
      provider: 'none',
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to process chat request.' });
  }
});

/**
 * Intent submission endpoint. Echoes back the intent object. In a real
 * implementation this would dispatch the intent to solvers or persist
 * it for settlement.
 */
app.post('/api/intent', (req, res) => {
  const { intent } = req.body || {};
  if (!intent) return res.status(400).json({ error: 'No intent provided.' });
  return res.json({ status: 'received', intent });
});

// ----------------------------
// Static file serving
// ----------------------------

// Serve the static React client from ../client. The root path returns index.html.
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

module.exports = { app, PORT };
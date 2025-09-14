# Intentive
Intentive is an experimental intent‑centric application that demonstrates how user preferences (intents) can be captured, assisted, and dispatched in a Web3 context. Built with Node.js, Express, React 18 and Tailwind CSS, Intentive showcases both a free‑form AI chatbot and a structured form to help users express intents such as token swaps, transfers or staking. The backend exposes simple REST endpoints, while the frontend features a polished dark‑mode UI with the official Anoma logo.

## Features
- AI‑assisted intent interface- Chat with an AI assistant (powered by Google Gemini or OpenAI, depending on your API key) to describe your intent in plain language. The assistant returns a suggested structured intent or guidance on how to specify it.
- Structured intent form- A clean form lets you explicitly state the action (swap, transfer, stake), the tokens or assets involved, the amount and any preferences (e.g., slippage, deadline). It outputs a JSON intent and sends it to the chat for processing.
- Dual provider chat support – If you supply a ```GOOGLE_API_KEY```, the app uses Gemini; if you supply an ```OPENAI_API_KEY```, it uses GPT‑3.5. When neither is set, it falls back to a helpful default response.
- REST API – Simple Express endpoints for health checks, chat completions, and intent submissions. These are used by the React client and can be called directly by other tools or scripts.
- Modern tech stack – React 18 with functional components and hooks, Tailwind CSS for styling, Express 4.18+ with JSON middleware, dotenv for configuration, and Vercel rewrites for serverless deployment.
- Stylish dark theme with Anoma branding – The Anoma logo is displayed in the header, and the UI uses a glass‑morphic dark palette with subtle gradients and borders.

## Getting started
### Prerequisites

- Node.js v18 or later
- npm (or pnpm/yarn) for installing dependencies
- A Google or OpenAI API key (optional but recommended)

### Installation

- Clone the repository and install server dependencies:
```
git clone https://github.com/your‑username/intentive-app-final.git
cd intentive-app-final/server
npm install
```

- Copy the example environment file and fill in one or both API keys:
```
cp .env.example .env
// edit .env and set GOOGLE_API_KEY=your_google_key or OPENAI_API_KEY=your_openai_key
```
- Start the backend server (which also serves the React client):
```npm start```

Open a browser to `http://localhost:3001`
- You’ll see the Intentive UI. Use the chat panel to describe an intent or the form to create a structured one. If an API key is configured, the assistant will respond using Gemini or OpenAI; otherwise it will display a fallback message.

For deployment on Vercel, the repository includes a vercel.json rewrite that directs all routes to the /api serverless function.

## API
Intentive exposes a small set of RESTful endpoints:

| Method & Path      | Purpose                    | Body/Query                                                         | Returns                                                                     |
| ------------------ | -------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `GET /api/health`  | Health check               | none                                                               | `{ ok: true, provider: "google" \| "openai" \| "none", node: "<version>" }` |
| `POST /api/chat`   | Request a chat completion  | `{ messages: [ { role, content }, … ] }`                           | `{ message: { role, content }, provider }`                                  |
| `POST /api/intent` | Submit a structured intent | `{ intent: { action, fromToken, toToken, amount, preferences? } }` | `{ status: "received", intent }`                                            |

The AI assistant expects the `messages` array to begin with a system prompt, followed by user and assistant messages.

## Project structure
```
api/            # Vercel serverless entrypoint (exports Express app)
server/
  app.js        # Express app with chat & intent routes, static serving
  index.js      # Local entrypoint (runs app.listen unless on Vercel)
  package.json  # Dependencies and start script
  .env.example  # Environment variable template
client/
  index.html    # Main HTML page with embedded React app and styles
  app.jsx       # Optional React component entry for bundlers
  assets/
    anoma-logo.png  # Official Anoma logo used in the header
vercel.json     # Rewrite rule to forward all routes to /api on Vercel
```
## Roadmap

- This project is a proof of concept. Possible future enhancements include:
- Persisting intents to a database or key‑value store instead of in memory.
- Authenticating users (e.g. Sign‑In with Ethereum) and signing intents cryptographically.
- Adding privacy features such as encrypted intents or shielded swaps.
- Integrating with real blockchain networks and solvers for actual settlements.
- Adding more intent types (e.g. liquidity provision, governance actions) and richer preference fields.
- Implementing continuous integration and tests via GitHub Actions.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests with bug fixes, new features, or improvements. For major changes or questions about the design, please open an issue first to discuss.
You can download this file and add it directly to your repository as README.md. Let me know if you need any further adjustments!



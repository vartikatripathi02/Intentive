/*
 * React application entry for the improved Intentive demo.
 *
 * This JSX file mirrors the inline script in index.html but uses Tailwind
 * classes for a modern look and feel. You can import this component in a
 * bundler setup (e.g. Vite) or reference it in a <script type="text/babel">
 * tag for development. The callChatAPI helper contacts the backend at
 * /api/chat for responses and supports both Google Gemini and OpenAI
 * providers.
 */

// System message used to prime the assistant. Defines the role.
export const SYSTEM_MESSAGE = {
  role: 'system',
  content:
    'You help users express intent-centric goals for blockchain activity. Be concise and suggest how to structure their intent.',
};

// Request chat completion from the backend
export async function callChatAPI(messages) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.message;
  } catch (err) {
    return { role: 'assistant', content: 'Error: ' + err.message };
  }
}

// Header component with logo and navigation
export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600/20 via-fuchsia-600/10 to-transparent border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <img src="assets/anoma-logo.png" alt="Anoma logo" className="w-14 h-14" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Intentive</h1>
          <p className="text-sm text-white/70 -mt-1">Intent‑centric apps done right</p>
        </div>
        <div className="ml-auto hidden md:flex gap-3">
          <a href="#" className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5">Docs</a>
          <a href="#" className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5">GitHub</a>
        </div>
      </div>
    </header>
  );
}

// Chat component with improved layout
export function ChatComponent({ messages, appendMessage }) {
  const [input, setInput] = React.useState('');
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    appendMessage(userMsg);
    const reply = await callChatAPI([SYSTEM_MESSAGE, ...messages.slice(1), userMsg]);
    appendMessage(reply);
  };
  return (
    <section className="glass rounded-2xl p-5 flex flex-col">
      <h2 className="text-lg font-medium mb-3">AI Chat Assistant</h2>
      <div className="flex-1 space-y-3 h-80 overflow-y-auto p-3 rounded-xl bg-black/20 border border-white/10">
        {messages
          .filter((_, idx) => idx > 0)
          .map((msg, idx) => (
            <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={`inline-block max-w-[85%] px-3 py-2 rounded-xl border border-white/10 ${
                  msg.role === 'user' ? 'bg-white/10' : 'bg-black/30'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          className="field flex-1"
          placeholder="Describe your intent…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="btn">Send</button>
      </div>
    </section>
  );
}

// Intent form component with refined layout
export function IntentForm({ appendMessage }) {
  const [action, setAction] = React.useState('swap');
  const [fromToken, setFromToken] = React.useState('');
  const [toToken, setToToken] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [preferences, setPreferences] = React.useState('');
  const [preview, setPreview] = React.useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromToken || !toToken || !amount) return;
    const intent = {
      action,
      fromToken,
      toToken,
      amount: parseFloat(amount),
      preferences: preferences || undefined,
    };
    setPreview(JSON.stringify(intent, null, 2));
    const userMsg = {
      role: 'user',
      content: 'Structured intent: ' + JSON.stringify(intent),
    };
    appendMessage(userMsg);
    const reply = await callChatAPI([SYSTEM_MESSAGE, userMsg]);
    appendMessage(reply);
    setPreferences('');
  };
  return (
    <section className="glass rounded-2xl p-5 flex flex-col">
      <h2 className="text-lg font-medium mb-3">Create Structured Intent</h2>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3">
        <div>
          <label className="text-sm text-white/70">Action</label>
          <select
            className="field w-full mt-1"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="swap">Swap Tokens</option>
            <option value="transfer">Transfer Assets</option>
            <option value="stake">Stake Tokens</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-white/70">From Token</label>
            <input
              className="field w-full mt-1"
              placeholder="e.g., USDC"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/70">To Token / Recipient</label>
            <input
              className="field w-full mt-1"
              placeholder="e.g., ETH or 0x…"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-white/70">Amount</label>
            <input
              type="number"
              step="0.0001"
              className="field w-full mt-1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Preferences</label>
            <input
              className="field w-full mt-1"
              placeholder="min price, deadline, slippage…"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn w-full">Submit Intent</button>
      </form>
      {preview && (
        <div className="mt-4 glass rounded-xl p-3 text-sm whitespace-pre-wrap border border-white/10">
          <strong>Generated Intent:</strong>
          <pre>{preview}</pre>
        </div>
      )}
    </section>
  );
}

export function App() {
  const [messages, setMessages] = React.useState([SYSTEM_MESSAGE]);
  const appendMessage = React.useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <ChatComponent messages={messages} appendMessage={appendMessage} />
        <IntentForm appendMessage={appendMessage} />
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-10 text-white/60 text-sm">
        © 2025 Intentive • Built for intent-centric apps.
      </footer>
    </>
  );
}

// If running via a script tag, expose to global to allow usage
if (typeof window !== 'undefined') {
  window.IntentiveApp = { App, Header, ChatComponent, IntentForm, callChatAPI, SYSTEM_MESSAGE };
}

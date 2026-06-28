import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'clara';
  text: string;
  refused?: boolean;
}

interface SearchBarProps {
  placeholder?: string;
  buttonLabel?: string;
  suggestions?: string[];
  responses?: Record<string, string>;
  fallback?: string;
  centered?: boolean;
}

export function SearchBar({
  placeholder = 'Ask Clara what to drink…',
  buttonLabel = 'Dive in',
  suggestions = [],
  responses = {},
  fallback = '',
  centered = false,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const appendClara = (text: string, refused = false) => {
    setMessages((prev) => [...prev, { role: 'clara', text, refused }]);
  };

  const submitLocal = (query: string) => {
    const canned = responses[query];
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: query },
      { role: 'clara', text: canned },
    ]);
    setValue('');
  };

  const submitApi = async (query: string, history: ChatMessage[]) => {
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setValue('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_ASK_CLARA_API_URL || ''}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: history.slice(-4).map((m) => ({
            role: m.role === 'clara' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        appendClara(fallback);
        return;
      }

      const { answer, refused } = (await res.json()) as { answer: string; refused: boolean };
      appendClara(answer, refused);
    } catch {
      appendClara(fallback);
    } finally {
      setLoading(false);
    }
  };

  const submit = (q?: string) => {
    const query = (q ?? value).trim();
    if (!query || loading) return;

    if (responses[query]) {
      submitLocal(query);
      return;
    }

    void submitApi(query, messages);
  };

  return (
    <div
      className={`search-bar${centered ? ' search-bar--centered' : ''}`}
      role="search"
      aria-label="Ask Clara about drinks"
    >
      <form
        className="search-bar__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <span className="search-bar__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.6 4.9a5 5 0 0 0 3.5 3.5L22 12l-4.9 1.6a5 5 0 0 0-3.5 3.5L12 22l-1.6-4.9a5 5 0 0 0-3.5-3.5L2 12l4.9-1.6a5 5 0 0 0 3.5-3.5L12 2z" />
          </svg>
        </span>
        <label htmlFor="clara-search" className="visually-hidden">
          {placeholder}
        </label>
        <input
          id="clara-search"
          type="search"
          className="search-bar__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          enterKeyHint="search"
          autoComplete="off"
          disabled={loading}
        />
        <button type="submit" className="search-bar__submit" disabled={loading}>
          {buttonLabel}
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="search-bar__chips" role="list" aria-label="Suggested questions">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="search-bar__chip"
              disabled={loading}
              onClick={() => {
                setValue(s);
                submit(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && (
        <div className="search-bar__messages" role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`search-bar__message search-bar__message--${msg.role}${
                msg.refused ? ' search-bar__answer--refused' : ''
              }`}
            >
              <strong>{msg.role === 'user' ? 'You' : 'Clara'}:</strong> {msg.text}
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="search-bar__loading" role="status" aria-live="polite">
          <span className="search-bar__spinner" aria-hidden="true" />
          Clara is thinking…
        </div>
      )}
    </div>
  );
}

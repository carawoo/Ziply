'use client';

import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, text]);
    setInput('');
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Chat</h1>

      <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8, minHeight: 200 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#6b7280' }}>메시지를 입력해 보세요.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {messages.map((m, i) => (
              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={send} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력…"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 700
          }}
        >
          보내기
        </button>
      </form>
    </main>
  );
}
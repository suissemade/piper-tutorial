"use client";
import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  async function send() {
    if (!input.trim()) return;

    const nextMsgs = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMsgs }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let assistant = "";

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      assistant += decoder.decode(value);
      setMessages([...nextMsgs, { role: "assistant", content: assistant }]);
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Chat input at top */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-3xl p-4">
          <div className="flex gap-2">
            <textarea
  className="flex-1 rounded-lg border px-4 py-4 text-lg leading-6 min-h-[84px] resize-none"
  placeholder="Hello Piper, what are we learning today?"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }}
/>
<button
  onClick={send}
  disabled={loading}
  className="rounded-lg border px-5 py-4 bg-slate-900 text-white text-lg disabled:opacity-50"
>
  {loading ? "Thinking…" : "Ask"}
</button><button
  onClick={() => setMessages([])}
  className="rounded-lg border px-4 py-3"
  type="button"
>
  New Chat
</button>

          </div>
          <p className="mt-2 text-xs text-slate-500">
            You got this Girlypop! Love you, Dad!
          </p>
        </div>
      </div>

      {/* Messages below */}
      <div ref={scrollerRef} className="mx-auto max-w-3xl p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={
                "inline-block rounded-2xl px-4 py-3 " +
                (m.role === "user" ? "bg-blue-100" : "bg-white border")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

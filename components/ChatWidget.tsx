"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; ts: number };

const STORAGE_KEY = "ai-dandi-chat-v1";
const MAX_INPUT = 300;

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! Saya AI Assistant Dandi. Mau tau apa nih — skills, projects, atau pengalamannya?",
  ts: 0,
};

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [WELCOME];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw) as Message[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME];
    return parsed;
  } catch {
    return [WELCOME];
  }
}

function saveHistory(messages: Message[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore quota errors */
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setMessages(loadHistory());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const fallback =
          res.status === 429
            ? "Pelan-pelan ya — max 10 pertanyaan tiap 5 menit."
            : "Maaf, lagi ada gangguan. Coba lagi sebentar ya.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fallback } : m
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;
          try {
            const data = JSON.parse(payload) as {
              delta?: string;
              done?: boolean;
            };
            if (data.delta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.delta }
                    : m
                )
              );
            }
          } catch {
            /* ignore malformed */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Koneksi terputus. Coba lagi ya." }
            : m
        )
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function clearHistory() {
    abortRef.current?.abort();
    setMessages([WELCOME]);
  }

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          aria-label="Open AI Assistant Dandi"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden brutal-border brutal-shadow bg-neon-yellow"
        >
          <Image
            src="/images/profile.png"
            alt="AI Assistant Dandi"
            width={80}
            height={80}
            className="w-full h-full object-cover"
            quality={75}
          />
          <span className="absolute -top-1 -right-1 bg-neon-pink brutal-border w-5 h-5 rounded-full flex items-center justify-center">
            <span className="block w-2 h-2 bg-white rounded-full animate-pulse" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[380px] sm:max-w-[calc(100vw-3rem)] flex flex-col bg-white brutal-border brutal-shadow max-h-[80vh] sm:h-[560px]">
          {/* Header */}
          <div className="computer-window-header flex-shrink-0">
            <span className="window-dot dot-red" />
            <span className="window-dot dot-yellow" />
            <span className="window-dot dot-green" />
            <span className="font-mono font-bold text-white text-xs ml-3 truncate">
              ai-dandi.exe
            </span>
            <button
              onClick={clearHistory}
              aria-label="Reset chat"
              className="ml-auto text-white text-xs font-mono hover:text-neon-yellow"
              title="Reset"
            >
              [reset]
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white text-xs font-mono hover:text-neon-pink ml-2"
            >
              [x]
            </button>
          </div>

          {/* Intro strip */}
          <div className="flex items-center gap-3 px-3 py-2 bg-neon-yellow border-b-4 border-pure-black flex-shrink-0">
            <Image
              src="/images/profile.png"
              alt="Dandi"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full brutal-border object-cover flex-shrink-0"
              quality={75}
            />
            <div className="min-w-0">
              <p className="font-headline font-black text-sm uppercase truncate">
                AI Assistant Dandi
              </p>
              <p className="font-mono text-[10px] text-pure-black/70 truncate">
                tanya tentang Dandi · powered by Hermes
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-container-low"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} streaming={streaming} />
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t-4 border-pure-black bg-white flex-shrink-0"
          >
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                placeholder="Tanya skill, project, pengalaman..."
                disabled={streaming}
                maxLength={MAX_INPUT}
                className="flex-1 min-w-0 brutal-border px-3 py-2 font-body text-sm focus:outline-none focus:bg-neon-yellow/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="bg-neon-pink text-white font-mono font-bold text-xs uppercase px-3 py-2 brutal-border brutal-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {streaming ? "..." : "Send"}
              </button>
            </div>
            <p className="font-mono text-[10px] text-pure-black/50 mt-1.5">
              {input.length}/{MAX_INPUT}
            </p>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const isEmptyAssistant = !isUser && message.content === "" && streaming;
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] brutal-border px-3 py-2 font-body text-sm whitespace-pre-wrap break-words",
          isUser
            ? "bg-neon-blue text-white brutal-shadow-sm"
            : "bg-white text-pure-black brutal-shadow-sm",
        ].join(" ")}
      >
        {isEmptyAssistant ? <TypingDots /> : message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-end h-4">
      <span className="w-1.5 h-1.5 bg-pure-black rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-pure-black rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-pure-black rounded-full animate-bounce" />
    </span>
  );
}

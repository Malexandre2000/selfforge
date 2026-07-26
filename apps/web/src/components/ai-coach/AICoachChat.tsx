"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Message = { id: string; role: "user" | "assistant"; content: string };

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-ink-950 text-white" : "border border-ink-200 bg-white text-ink-800"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export function AICoachChat() {
  const { data: profile, isLoading: profileLoading } = trpc.onboarding.get.useQuery();
  const utils = trpc.useUtils();
  const { data: history, isLoading: historyLoading } = trpc.aiCoach.getMessages.useQuery(
    undefined,
    { enabled: !!profile },
  );

  const [pending, setPending] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages: Message[] = [
    ...(history ?? []),
    ...pending,
    ...(isStreaming ? [{ id: "streaming", role: "assistant" as const, content: streamingText }] : []),
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, streamingText]);

  async function send() {
    const content = input.trim();
    if (!content || isStreaming) return;
    setInput("");
    setPending((p) => [...p, { id: `pending-${Date.now()}`, role: "user", content }]);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok || !res.body) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreamingText(text);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setPending([]);
      utils.aiCoach.getMessages.invalidate();
    }
  }

  if (profileLoading) {
    return <p className="mx-auto max-w-2xl px-5 py-10 text-ink-500 sm:px-8">Loading…</p>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-center sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Your AI Coach
        </h1>
        <p className="mt-4 text-ink-500">
          Complete your onboarding so your coach knows who you're talking to.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink-950 px-7 text-base font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Start onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-2xl flex-col px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        Your AI Coach
      </h1>
      <p className="mt-2 text-ink-500">Ask anything — it knows your goals and history.</p>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
        {historyLoading ? (
          <p className="text-ink-500">Loading your conversation…</p>
        ) : allMessages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-300 bg-white p-6 text-center text-ink-500">
            Say hello to start your first conversation.
          </div>
        ) : (
          allMessages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
        )}
        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mt-4 flex items-end gap-3 border-t border-ink-200 pt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask your coach anything…"
          rows={1}
          className="h-12 flex-1 resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm text-ink-950 outline-none placeholder:text-ink-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || isStreaming}
          aria-label="Send message"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

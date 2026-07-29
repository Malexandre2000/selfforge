"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type FeedbackType = "feedback" | "bug";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feedback");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSent(true);
      setMessage("");
    },
  });

  function close() {
    setOpen(false);
    // Reset after the close animation would run, so reopening starts fresh.
    setTimeout(() => setSent(false), 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Give feedback or report a bug"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageSquarePlus size={20} />
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm rounded-lg border border-ink-200 bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink-950">
              {sent ? "Thanks!" : "Feedback"}
            </h2>
            <button onClick={close} aria-label="Close" className="text-ink-400 hover:text-ink-950">
              <X size={18} />
            </button>
          </div>

          {sent ? (
            <p className="mt-3 text-sm text-ink-500">
              We read every submission — thanks for helping shape this.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate({ type, message, pageUrl: pathname });
              }}
              className="mt-3 flex flex-col gap-3"
            >
              <div className="flex gap-2">
                {(["feedback", "bug"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                      type === t
                        ? "bg-ink-950 text-white"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                  >
                    {t === "bug" ? "Report a bug" : "Feedback"}
                  </button>
                ))}
              </div>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === "bug" ? "What happened? What did you expect instead?" : "What's on your mind?"
                }
                rows={4}
                className="resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-950 outline-none placeholder:text-ink-400 focus:border-ink-950"
              />
              {submit.isError && <p className="text-xs text-red-600">Couldn&apos;t send that — try again.</p>}
              <button
                type="submit"
                disabled={submit.isPending || !message.trim()}
                className="h-10 rounded-full bg-ink-950 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40"
              >
                {submit.isPending ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

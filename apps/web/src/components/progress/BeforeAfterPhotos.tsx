"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Kind = "before" | "after";

function photoSrc(pathname: string) {
  return `/api/photos/${pathname}`;
}

function PhotoSlot({
  label,
  kind,
  pathname,
  onUploaded,
}: {
  label: string;
  kind: Kind;
  pathname: string | null;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/upload/progress-photo", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      onUploaded();
    } catch {
      setError("Couldn't upload that photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload/progress-photo?kind=${kind}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      onUploaded();
    } catch {
      setError("Couldn't remove that photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-ink-400">
        {label}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-dashed border-ink-300 bg-ink-50">
        {busy ? (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : pathname ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- served from our own authenticated proxy, not remote-optimizable */}
            <img
              src={photoSrc(pathname)}
              alt={`${label} progress photo`}
              className="h-full w-full object-cover"
            />
            <button
              onClick={remove}
              aria-label={`Remove ${label} photo`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400 hover:text-ink-600"
          >
            <Camera size={22} strokeWidth={1.75} />
            <span className="text-sm">Add photo</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function BeforeAfterPhotos({
  photos,
}: {
  photos: { before: string | null; after: string | null };
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.progress.get.invalidate();

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl text-ink-950">Before / After</h2>
      <p className="mt-1 text-sm text-ink-500">
        Only visible to you — kept in your private storage.
      </p>

      <div className="mt-5 flex gap-4">
        <PhotoSlot label="Before" kind="before" pathname={photos.before} onUploaded={refresh} />
        <PhotoSlot label="After" kind="after" pathname={photos.after} onUploaded={refresh} />
      </div>
    </div>
  );
}

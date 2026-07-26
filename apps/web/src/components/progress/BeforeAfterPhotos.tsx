"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

function PhotoSlot({
  label,
  src,
  onPick,
  onRemove,
}: {
  label: string;
  src: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-ink-400">
        {label}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-dashed border-ink-300 bg-ink-50">
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, not an optimizable remote image */}
            <img src={src} alt={`${label} progress photo`} className="h-full w-full object-cover" />
            <button
              onClick={onRemove}
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
            if (file) onPick(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export function BeforeAfterPhotos() {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);

  function pick(setter: (url: string) => void, current: string | null) {
    return (file: File) => {
      if (current) URL.revokeObjectURL(current);
      setter(URL.createObjectURL(file));
    };
  }

  function remove(setter: (url: string | null) => void, current: string | null) {
    return () => {
      if (current) URL.revokeObjectURL(current);
      setter(null);
    };
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl text-ink-950">Before / After</h2>
      <p className="mt-1 text-sm text-ink-500">
        Photos stay on this device only until account photo sync is built — nothing is
        uploaded yet.
      </p>

      <div className="mt-5 flex gap-4">
        <PhotoSlot
          label="Before"
          src={before}
          onPick={pick(setBefore, before)}
          onRemove={remove(setBefore, before)}
        />
        <PhotoSlot
          label="After"
          src={after}
          onPick={pick(setAfter, after)}
          onRemove={remove(setAfter, after)}
        />
      </div>
    </div>
  );
}

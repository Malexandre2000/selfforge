import Link from "next/link";
import { Camera } from "lucide-react";

type Photos = { before: string | null; after: string | null };

function photoSrc(pathname: string) {
  return `/api/photos/${pathname}`;
}

export function BeforeAfterGallery({ photos }: { photos: Photos }) {
  if (!photos.before && !photos.after) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 bg-white p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-ink-100">
          <Camera size={20} strokeWidth={1.75} className="text-ink-500" />
        </div>
        <h2 className="mt-4 font-display text-xl text-ink-950">
          Your before/after gallery is empty
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Add your first progress photo and watch the change build up over time,
          side by side.
        </p>
        <Link
          href="/progress"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Add your first photo
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl text-ink-950">Before / After</h2>
      <div className="mt-4 flex gap-4">
        {(["before", "after"] as const).map((kind) => (
          <div key={kind} className="flex-1">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-ink-400">
              {kind}
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
              {photos[kind] ? (
                // eslint-disable-next-line @next/next/no-img-element -- served from our own authenticated proxy, not remote-optimizable
                <img
                  src={photoSrc(photos[kind]!)}
                  alt={`${kind} progress photo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Link
                  href="/progress"
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400 hover:text-ink-600"
                >
                  <Camera size={22} strokeWidth={1.75} />
                  <span className="text-sm">Add photo</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

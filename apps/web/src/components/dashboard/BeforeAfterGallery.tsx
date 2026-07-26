import Link from "next/link";
import { Camera } from "lucide-react";

export function BeforeAfterGallery() {
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

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-500">
        Coming up next
      </span>
      <h1 className="mt-6 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-ink-500">{blurb}</p>
    </div>
  );
}

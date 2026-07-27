export function QueryError({
  message = "Something went wrong loading this.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6 text-center">
      <p className="text-ink-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        Retry
      </button>
    </div>
  );
}

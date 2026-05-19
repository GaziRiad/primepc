"use client"; // Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message || "Something went wrong.";

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p className="mt-2 text-sm opacity-70">{message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

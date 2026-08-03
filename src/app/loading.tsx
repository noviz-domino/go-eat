export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-zinc-100"
          />
        ))}
      </div>
    </main>
  );
}

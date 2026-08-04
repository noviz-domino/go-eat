export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:flex-row md:items-start md:gap-10">
      <aside className="w-full shrink-0 md:w-64">
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
      </aside>
      <main className="min-w-0 flex-1">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

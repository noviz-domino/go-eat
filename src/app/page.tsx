import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import type { Restaurant } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  const visitedCount = restaurants?.filter((r) => r.visited).length ?? 0;
  const totalCount = restaurants?.length ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">🍜 가봐야 알지</h1>
        <form action={logout}>
          <button className="text-sm text-zinc-500 underline">로그아웃</button>
        </form>
      </header>

      <p className="mb-8 text-sm text-zinc-500">{user.email}</p>

      {totalCount > 0 && (
        <p className="mb-6 text-sm font-medium">
          {totalCount}곳 중 {visitedCount}곳 정복
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          맛집 목록을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {totalCount === 0 && !error && (
        <div className="py-20 text-center">
          <p className="text-4xl">🍜</p>
          <p className="mt-4 font-medium">아직 등록한 맛집이 없어요</p>
          <p className="mt-1 text-sm text-zinc-500">
            검색해도 안 나오는 그 집, 직접 기록해보세요
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {restaurants?.map((restaurant: Restaurant) => (
          <li
            key={restaurant.id}
            className="rounded-2xl border border-zinc-100 p-4 shadow-sm"
          >
            <div className="flex items-baseline justify-between">
              <strong className="text-lg font-semibold">
                {restaurant.name}
              </strong>
              <span className="text-sm text-zinc-500">
                {restaurant.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-600">
              {restaurant.visited
                ? `${"★".repeat(restaurant.rating ?? 0)} · ${restaurant.visited_at ?? ""} 방문`
                : "아직 안 가봄"}
            </p>
            {restaurant.memo && (
              <p className="mt-2 text-sm text-zinc-500">{restaurant.memo}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

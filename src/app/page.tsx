import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { CATEGORIES, CATEGORY_ICONS, type Restaurant } from "@/lib/types";
import { SearchInput } from "./search-input";
import { CategoryFilter } from "./category-filter";

type VisitedFilter = "all" | "todo" | "done";

type Props = {
  searchParams: Promise<{
    q?: string;
    visited?: string;
    category?: string;
  }>;
};

// 검색어·방문탭은 유지한 채 하나의 값만 바꾼 링크를 만든다.
function buildHref(
  current: { q: string; visited: VisitedFilter; category: string },
  override: Partial<typeof current>,
) {
  const merged = { ...current, ...override };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.visited !== "all") params.set("visited", merged.visited);
  if (merged.category) params.set("category", merged.category);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function Home({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const visited: VisitedFilter =
    sp.visited === "todo" || sp.visited === "done" ? sp.visited : "all";
  const category = CATEGORIES.includes(
    sp.category as (typeof CATEGORIES)[number],
  )
    ? sp.category!
    : "";

  const filters = { q, visited, category };

  // 진행률 바는 필터와 무관하게 항상 "전체" 기준이어야 하므로 별도로 조회한다.
  const { data: allRows } = await supabase.from("restaurants").select("visited");
  const allCount = allRows?.length ?? 0;
  const visitedAllCount = allRows?.filter((r) => r.visited).length ?? 0;

  let query = supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (visited === "todo") {
    query = query.eq("visited", false);
  } else if (visited === "done") {
    query = query.eq("visited", true);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data: restaurants, error } = await query;
  const filteredCount = restaurants?.length ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">🍜 가봐야 알지</h1>
        <form action={logout}>
          <button className="text-sm text-zinc-500 underline">로그아웃</button>
        </form>
      </header>

      <p className="mb-8 text-sm text-zinc-500">{user.email}</p>

      {allCount > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium">
            {allCount}곳 중 {visitedAllCount}곳 정복
          </p>
          <div className="mt-2 h-2 rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.round((visitedAllCount / allCount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          맛집 목록을 불러오지 못했습니다: {error.message}
        </p>
      )}

      {allCount === 0 && !error && (
        <div className="py-20 text-center">
          <p className="text-4xl">🍜</p>
          <p className="mt-4 font-medium">아직 등록한 맛집이 없어요</p>
          <p className="mt-1 text-sm text-zinc-500">
            검색해도 안 나오는 그 집, 직접 기록해보세요
          </p>
          <Link
            href="/restaurants/new"
            className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white"
          >
            첫 맛집 등록하기
          </Link>
        </div>
      )}

      {allCount > 0 && (
        <div className="mb-6 flex flex-col gap-3">
          <SearchInput defaultValue={q} />

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {(
                [
                  { key: "all", label: "전체" },
                  { key: "todo", label: "가볼 곳" },
                  { key: "done", label: "갔던 곳" },
                ] as const
              ).map((tab) => (
                <Link
                  key={tab.key}
                  href={buildHref(filters, { visited: tab.key })}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    visited === tab.key
                      ? "bg-accent text-white"
                      : "border border-zinc-200 text-zinc-600"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <CategoryFilter defaultValue={category} />
          </div>
        </div>
      )}

      {allCount > 0 && filteredCount === 0 && !error && (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-500">조건에 맞는 맛집이 없어요</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium"
          >
            필터 초기화
          </Link>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {restaurants?.map((restaurant: Restaurant) => (
          <li key={restaurant.id}>
            <Link
              href={`/restaurants/${restaurant.id}`}
              className="flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                {CATEGORY_ICONS[restaurant.category] ?? "🍽️"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <strong className="text-lg font-bold">
                    {restaurant.name}
                  </strong>
                  <span className="text-[13px] text-zinc-500">
                    {restaurant.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  {restaurant.visited
                    ? `${"★".repeat(restaurant.rating ?? 0)} · ${restaurant.visited_at ?? ""} 방문`
                    : "아직 안 가봄"}
                </p>
                {(restaurant.memo_summary || restaurant.memo) && (
                  <p className="mt-2 line-clamp-2 text-[13px] text-zinc-500">
                    {restaurant.memo_summary ??
                      // AI 요약이 아직 없는 예전 메모는 앞부분만 잘라서 보여준다.
                      `${restaurant.memo!.slice(0, 40)}${restaurant.memo!.length > 40 ? "…" : ""}`}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {allCount > 0 && (
        <Link
          href="/restaurants/new"
          className="mt-8 block rounded-xl bg-accent py-3 text-center text-sm font-medium text-white"
        >
          + 맛집 등록
        </Link>
      )}
    </main>
  );
}

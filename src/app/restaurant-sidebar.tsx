import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { CategoryFilter } from "./category-filter";
import { SidebarShell } from "./sidebar-shell";

export const VISITED_TABS = [
  { key: "all", label: "전체", icon: "📋" },
  { key: "todo", label: "가볼 곳", icon: "📍" },
  { key: "done", label: "갔던 곳", icon: "✅" },
] as const;

export type VisitedFilter = "all" | "todo" | "done";

// 검색어·방문탭은 유지한 채 하나의 값만 바꾼 링크를 만든다.
export function buildHref(
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

type Props = {
  email: string | null;
  allCount: number;
  visitedAllCount: number;
  activeVisited: VisitedFilter;
  activeCategory: string;
  activeQuery: string;
  children: React.ReactNode;
};

// 목록·상세 화면이 함께 쓰는 사이드바. 페이지마다 로고·계정·필터가 그대로 유지되도록
// 조립된 결과를 SidebarShell에 넘긴다.
export function RestaurantSidebar({
  email,
  allCount,
  visitedAllCount,
  activeVisited,
  activeCategory,
  activeQuery,
  children,
}: Props) {
  const filters = { q: activeQuery, visited: activeVisited, category: activeCategory };
  const emailInitial = email?.[0]?.toUpperCase() ?? "?";

  const fullSidebar = (
    <>
      <Link href="/" className="text-xl font-bold">
        🍜 가봐야 알지
      </Link>

      {allCount > 0 && (
        <div>
          <p className="text-sm font-medium">
            {allCount}곳 중 {visitedAllCount}곳 정복
          </p>
          <div className="mt-2 h-2 rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${Math.round((visitedAllCount / allCount) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {allCount > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            {VISITED_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={buildHref(filters, { visited: tab.key })}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  activeVisited === tab.key
                    ? "bg-accent text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <CategoryFilter defaultValue={activeCategory} />
        </div>
      )}

      <div className="mt-auto flex flex-col gap-4 border-t border-zinc-100 pt-4">
        {allCount > 0 && (
          <Link
            href="/restaurants/new"
            className="block rounded-xl bg-accent py-3 text-center text-sm font-medium text-white"
          >
            + 맛집 등록
          </Link>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              {emailInitial}
            </div>
            <p className="truncate text-sm text-zinc-500">{email}</p>
          </div>
          <form action={logout}>
            <button className="shrink-0 text-sm text-zinc-500 underline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </>
  );

  const collapsedSidebar = (
    <>
      <Link
        href="/"
        className="flex h-10 w-10 items-center justify-center self-center rounded-xl text-xl"
        aria-label="가봐야 알지"
      >
        🍜
      </Link>

      {allCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          {VISITED_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={buildHref(filters, { visited: tab.key })}
              title={tab.label}
              aria-label={tab.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                activeVisited === tab.key ? "bg-accent text-white" : "hover:bg-zinc-100"
              }`}
            >
              {tab.icon}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-3 border-t border-zinc-100 pt-4">
        {allCount > 0 && (
          <Link
            href="/restaurants/new"
            title="맛집 등록"
            aria-label="맛집 등록"
            className="flex h-10 w-10 items-center justify-center self-center rounded-xl bg-accent text-xl font-medium text-white"
          >
            +
          </Link>
        )}

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
          title={email ?? undefined}
        >
          {emailInitial}
        </div>
      </div>
    </>
  );

  return (
    <SidebarShell full={fullSidebar} collapsed={collapsedSidebar}>
      {children}
    </SidebarShell>
  );
}

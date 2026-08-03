import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleVisited, deleteRestaurant } from "@/app/actions/restaurants";
import { DeleteButton } from "./delete-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS가 이미 "본인 것만" 조회되게 걸러준다.
  // 남의 id로 접근하면 존재하지 않는 것처럼 data가 null로 온다.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-8">
      <Link href="/" className="text-sm text-zinc-500">
        ← 목록으로
      </Link>

      <h1 className="mt-4 text-xl font-bold">{restaurant.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">{restaurant.category}</p>

      {restaurant.address && (
        <p className="mt-4 text-sm">📍 {restaurant.address}</p>
      )}

      {restaurant.visited ? (
        <p className="mt-2 text-sm">
          {restaurant.rating ? "★".repeat(restaurant.rating) : ""}
          {restaurant.rating ? " · " : ""}✅ {restaurant.visited_at ?? ""} 방문
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">아직 안 가봄</p>
      )}

      {restaurant.memo && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">
          📝 {restaurant.memo}
        </p>
      )}

      <form action={toggleVisited} className="mt-8">
        <input type="hidden" name="id" value={restaurant.id} />
        <button
          type="submit"
          className="w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium"
        >
          {restaurant.visited ? "방문 체크 해제" : "방문 체크"}
        </button>
      </form>

      <div className="mt-3 flex gap-3">
        <Link
          href={`/restaurants/${restaurant.id}/edit`}
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-center text-sm font-medium"
        >
          수정
        </Link>
        <DeleteButton id={restaurant.id} action={deleteRestaurant} />
      </div>
    </main>
  );
}

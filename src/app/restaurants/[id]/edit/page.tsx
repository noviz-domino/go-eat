import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditRestaurantForm } from "./restaurant-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditRestaurantPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS가 본인 것만 조회되게 걸러준다. 남의 id면 존재하지 않는 것처럼 온다.
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
      <Link href={`/restaurants/${id}`} className="text-sm text-zinc-500">
        ← 취소
      </Link>
      <h1 className="mt-4 mb-8 text-xl font-bold">맛집 수정</h1>

      <EditRestaurantForm restaurant={restaurant} />
    </main>
  );
}

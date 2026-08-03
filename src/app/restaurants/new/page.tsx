import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewRestaurantForm } from "./restaurant-form";

export default async function NewRestaurantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-8">
      <Link href="/" className="text-sm text-zinc-500">
        ← 취소
      </Link>
      <h1 className="mt-4 mb-8 text-xl font-bold">맛집 등록</h1>

      <NewRestaurantForm />
    </main>
  );
}

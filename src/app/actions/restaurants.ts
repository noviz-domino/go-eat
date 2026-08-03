"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseRestaurantForm } from "@/lib/restaurant-form";

export type RestaurantFormState = { error?: string };

export async function createRestaurant(
  _prev: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const supabase = await createClient();

  // Server Action은 UI를 거치지 않고 직접 POST로도 호출될 수 있다.
  // 따라서 화면에서 이미 막았더라도 여기서 로그인 여부를 다시 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = parseRestaurantForm(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("restaurants").insert({
    name: parsed.value.name,
    category: parsed.value.category,
    address: parsed.value.address,
    memo: parsed.value.memo,
    visited: parsed.value.visited,
    visited_at: parsed.value.visitedAt,
    rating: parsed.value.rating,
    // 클라이언트가 보낸 값을 쓰지 않고 서버가 확인한 사용자 id를 넣는다.
    user_id: user.id,
  });

  if (error) {
    return { error: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateRestaurant(
  _prev: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { error: "잘못된 요청입니다." };
  }

  const parsed = parseRestaurantForm(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  // user_id는 애초에 수정 대상에 없다. RLS가 이 id의 소유자가 아니면 0행을 갱신한다.
  const { error } = await supabase
    .from("restaurants")
    .update({
      name: parsed.value.name,
      category: parsed.value.category,
      address: parsed.value.address,
      memo: parsed.value.memo,
      visited: parsed.value.visited,
      visited_at: parsed.value.visitedAt,
      rating: parsed.value.rating,
    })
    .eq("id", id);

  if (error) {
    return { error: `수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath(`/restaurants/${id}`);
  redirect(`/restaurants/${id}`);
}

export async function toggleVisited(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/");
  }

  const { data: current } = await supabase
    .from("restaurants")
    .select("visited")
    .eq("id", id)
    .single();

  if (!current) {
    redirect("/");
  }

  const nextVisited = !current.visited;

  await supabase
    .from("restaurants")
    .update({
      visited: nextVisited,
      // 방문 체크를 해제하면 별점·방문일도 함께 지운다 (기획서 데이터 규칙)
      ...(nextVisited ? {} : { rating: null, visited_at: null }),
    })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath(`/restaurants/${id}`);
  redirect(`/restaurants/${id}`);
}

export async function deleteRestaurant(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");

  if (id) {
    // RLS가 본인 소유 행만 지우도록 걸러준다. 남의 id를 보내도 아무 일도 안 일어난다.
    await supabase.from("restaurants").delete().eq("id", id);
  }

  revalidatePath("/");
  redirect("/");
}

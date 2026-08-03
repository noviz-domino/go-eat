"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";

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

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const visited = formData.get("visited") === "on";
  const visitedAtRaw = String(formData.get("visited_at") ?? "");
  const ratingRaw = String(formData.get("rating") ?? "");

  if (!name) {
    return { error: "가게 이름을 입력해주세요." };
  }

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "카테고리를 선택해주세요." };
  }

  // 미방문이면 별점·방문일은 저장하지 않는다 (기획서의 데이터 규칙)
  let rating: number | null = null;
  let visitedAt: string | null = null;

  if (visited) {
    if (ratingRaw) {
      const parsed = Number(ratingRaw);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
        return { error: "별점은 1~5 사이여야 합니다." };
      }
      rating = parsed;
    }
    visitedAt = visitedAtRaw || null;
  }

  const { error } = await supabase.from("restaurants").insert({
    name,
    category,
    address: address || null,
    memo: memo || null,
    visited,
    visited_at: visitedAt,
    rating,
    // 클라이언트가 보낸 값을 쓰지 않고 서버가 확인한 사용자 id를 넣는다.
    user_id: user.id,
  });

  if (error) {
    return { error: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/");
  redirect("/");
}

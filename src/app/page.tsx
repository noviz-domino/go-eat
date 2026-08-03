import { supabase, Restaurant } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main>
      <h1>가서 먹어</h1>

      {error && <p>맛집 목록을 불러오지 못했습니다: {error.message}</p>}

      <ul>
        {restaurants?.map((restaurant: Restaurant) => (
          <li key={restaurant.id}>
            <strong>{restaurant.name}</strong> · {restaurant.category}
            {restaurant.visited ? " · 방문함" : " · 아직 안 가봄"}
            {restaurant.rating ? ` · ★${restaurant.rating}` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}

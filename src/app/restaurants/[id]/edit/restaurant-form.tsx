"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  updateRestaurant,
  type RestaurantFormState,
} from "@/app/actions/restaurants";
import { CATEGORIES, type Restaurant } from "@/lib/types";
import { StarRating } from "@/components/star-rating";

const initialState: RestaurantFormState = {};

const inputClass =
  "rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400";

type Props = {
  restaurant: Restaurant;
};

export function EditRestaurantForm({ restaurant }: Props) {
  const [state, formAction, pending] = useActionState(
    updateRestaurant,
    initialState,
  );
  const [name, setName] = useState(restaurant.name);
  const [visited, setVisited] = useState(restaurant.visited);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={restaurant.id} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          가게 이름 <span className="text-red-500">*</span>
        </span>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          카테고리 <span className="text-red-500">*</span>
        </span>
        <select
          name="category"
          required
          defaultValue={restaurant.category}
          className={inputClass}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">주소</span>
        <input
          name="address"
          defaultValue={restaurant.address ?? ""}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="visited"
            checked={visited}
            onChange={(e) => setVisited(e.target.checked)}
            className="size-4"
          />
          <span className="text-sm font-medium">이미 다녀왔어요</span>
        </label>

        {visited && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-zinc-600">방문일</span>
              <input
                type="date"
                name="visited_at"
                defaultValue={restaurant.visited_at ?? ""}
                className={`${inputClass} bg-white`}
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-zinc-600">별점</span>
              <StarRating name="rating" defaultValue={restaurant.rating} />
            </div>
          </>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">메모</span>
        <textarea
          name="memo"
          rows={3}
          defaultValue={restaurant.memo ?? ""}
          className={inputClass}
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="mt-2 flex gap-3">
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-center text-sm font-medium"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "수정 중..." : "수정 완료"}
        </button>
      </div>
    </form>
  );
}

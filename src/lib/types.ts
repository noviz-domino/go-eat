export type Restaurant = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  rating: number | null;
  visited: boolean;
  visited_at: string | null;
  memo: string | null;
  user_id: string;
  created_at: string;
};

export const CATEGORIES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "카페·디저트",
  "기타",
] as const;

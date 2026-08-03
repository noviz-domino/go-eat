import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Restaurant = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  rating: number | null;
  visited: boolean;
  visited_at: string | null;
  memo: string | null;
  user_id: string | null;
  created_at: string;
};

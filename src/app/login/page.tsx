import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold">🍜 가봐야 알지</h1>
          <p className="mt-2 text-sm text-zinc-500">
            시골 맛집은 가봐야 압니다
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}

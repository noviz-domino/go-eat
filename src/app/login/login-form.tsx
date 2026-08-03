"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && (
        <p className="text-sm text-zinc-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-accent py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="text-sm text-zinc-500 underline"
      >
        {mode === "login"
          ? "계정이 없으신가요? 가입하기"
          : "이미 계정이 있으신가요? 로그인"}
      </button>
    </form>
  );
}

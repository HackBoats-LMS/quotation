"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../actions";
import { ShieldAlert, Lock, AlertCircle, RefreshCw, ChevronRight, ArrowLeft } from "lucide-react";
import MidnightSky from "@/components/MidnightSky";
import Link from "next/link";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter your admin access key.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAdmin(password);
        if (result.success) {
          router.push("/admin");
          router.refresh();
        } else {
          setError(result.error || "Authentication failed.");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <MidnightSky />
      <Link 
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-300 shadow-xl backdrop-blur-md transition-all hover:bg-white/10 hover:text-white hover:scale-105"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-xl">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            System Administration
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Authorized administrative access only
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400"
              >
                Access Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="block w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:bg-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isPending}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:scale-100"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

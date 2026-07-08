import { createBrowserClient } from "@supabase/ssr";
import { getSession } from "next-auth/react";

let cachedSession: any = null;
let sessionPromise: Promise<any> | null = null;
let lastFetchedTime = 0;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const now = Date.now();
          // Refresh session if it's older than 45 minutes (Supabase JWTs expire in 1 hr)
          if (!cachedSession || (now - lastFetchedTime > 45 * 60 * 1000)) {
            if (!sessionPromise) {
              sessionPromise = getSession();
            }
            cachedSession = await sessionPromise;
            lastFetchedTime = now;
            sessionPromise = null;
          }
          if (cachedSession?.supabaseAccessToken) {
            options.headers = new Headers(options.headers);
            options.headers.set("Authorization", `Bearer ${cachedSession.supabaseAccessToken}`);
          }
          return fetch(url, options);
        },
      },
    }
  );
}

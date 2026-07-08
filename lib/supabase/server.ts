import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();

  let supabaseAccessToken = null;
  try {
    const req = new NextRequest("http://localhost", { headers: headersList });
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (token) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET;
      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
          sub: token.sub,
          email: token.email,
          role: "authenticated",
        };
        supabaseAccessToken = jwt.sign(payload, signingSecret);
      }
    }
  } catch (err) {
    console.error("NextAuth getToken error:", err);
  }

  const options: any = {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  };

  if (supabaseAccessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    };
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
}

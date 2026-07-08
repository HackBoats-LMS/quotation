import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  let session = null;
  try {
    session = await getSession();
  } catch (e: any) {
    session = { error: e.message };
  }

  return NextResponse.json({
    cookies: allCookies,
    extractedToken: sessionToken,
    session: session
  });
}

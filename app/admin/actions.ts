"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_VAL = "authenticated-admin";

function getSignature(value: string) {
  const secret = process.env.SESSION_SECRET || "fallback-secret-for-admin-session-signing-123456";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return false;

  const parts = sessionCookie.value.split(":");
  if (parts.length !== 2) return false;

  const [val, sig] = parts;
  if (val !== SESSION_VAL) return false;

  const expectedSig = getSignature(val);
  return sig === expectedSig;
}

export async function loginAdmin(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expectedPassword) {
    return { success: false, error: "Invalid password." };
  }

  const sig = getSignature(SESSION_VAL);
  const cookieValue = `${SESSION_VAL}:${sig}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "lax",
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function getInvitedUsers() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("invited_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invited users details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  return data || [];
}

export async function inviteUser(email: string) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const { error } = await supabase
    .from("invited_users")
    .insert([{ email: cleanEmail }]);

  if (error) {
    console.error("Error inserting invited user:", error);
    if (error.code === "23505") { // PostgreSQL unique violation code
      return { success: false, error: "This email has already been invited." };
    }
    return { success: false, error: error.message || "Failed to invite user." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function revokeAccess(id: string) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  const { error } = await supabase
    .from("invited_users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invited user:", error);
    return { success: false, error: error.message || "Failed to revoke access." };
  }

  revalidatePath("/admin");
  return { success: true };
}

"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

const SESSION_COOKIE_NAME = "owner_session";

function getSignature(value: string) {
  const secret = process.env.SESSION_SECRET || "fallback-secret-for-owner-session-signing-123456";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function getLoggedInOwnerEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;

  const parts = sessionCookie.value.split(":");
  if (parts.length !== 2) return null;

  const [email, sig] = parts;
  const expectedSig = getSignature(email);

  if (sig !== expectedSig) return null;
  return email;
}

export async function loginOwner(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Verify invitation
  const { data: invite, error: inviteError } = await supabase
    .from("invited_users")
    .select("email")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (inviteError) {
    console.error("Database error looking up invite:", inviteError);
    return { success: false, error: "An error occurred during verification." };
  }

  if (!invite) {
    return { 
      success: false, 
      error: "Access Denied. This email has not been invited by the administrator." 
    };
  }

  // Create session
  const sig = getSignature(cleanEmail);
  const cookieValue = `${cleanEmail}:${sig}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  revalidatePath("/dashboard");
  revalidatePath("/business-setup");
  return { success: true };
}

export async function logoutOwner() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath("/login");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBusinessProfile(ownerEmail: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_email", ownerEmail)
    .maybeSingle();

  if (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }

  return data || null;
}

export async function createBusinessProfile(formData: {
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
}) {
  const ownerEmail = await getLoggedInOwnerEmail();
  if (!ownerEmail) {
    return { success: false, error: "Session expired or unauthorized." };
  }

  const { error } = await supabase
    .from("businesses")
    .insert([
      {
        name: formData.name.trim(),
        owner_name: formData.ownerName.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        owner_email: ownerEmail,
      }
    ]);

  if (error) {
    console.error("Error creating business profile:", error);
    if (error.code === "23505") { // Unique violation
      return { success: false, error: "A profile already exists for this owner email." };
    }
    return { success: false, error: error.message || "Failed to save profile." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/business-setup");
  return { success: true };
}

"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function completeOnboarding(formData: {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tax_number: string;
  currency: string;
}) {
  const session = await getSession();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    const business = await prisma.businesses.create({
      data: {
        name: formData.name,
        owner_name: session?.user?.name || "Owner", 
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        tax_number: formData.tax_number,
        currency: formData.currency || "USD",
        owner_email: userEmail,
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Onboarding Prisma error:", err);
    if (err.code === "P2002") {
      return { success: false, error: "A business is already registered with this account." };
    }
    return { success: false, error: err.message || "Failed to create business" };
  }
}

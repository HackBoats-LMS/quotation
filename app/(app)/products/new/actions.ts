"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createProduct(data: any) {
  const session = await getSession();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("Unauthorized");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true },
  });
  if (!business?.id) throw new Error("No business");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .insert([{ ...data, business_id: business.id }]);

  if (error) throw error;
  return true;
}

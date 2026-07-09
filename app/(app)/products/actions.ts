"use server";


import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateGlobalSettings(tax: number, discount: number) {
  const session = await getSession();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("Unauthorized");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true },
  });

  if (!business?.id) throw new Error("No business");

  await prisma.businesses.update({
    where: { id: business.id },
    data: {
      default_tax_rate: tax,
      default_discount_rate: discount,
    }
  });
  
  revalidatePath("/products");
  revalidatePath("/quotations/new");
  return true;
}

export async function importProducts(products: any[]) {
  const session = await getSession();
  const userEmail = session?.user?.email;
  if (!userEmail) throw new Error("Unauthorized");

  const business = await prisma.businesses.findUnique({
    where: { owner_email: userEmail },
    select: { id: true },
  });

  if (!business?.id) throw new Error("No business");

  // Format the products to include business_id and map correctly
  const productsToInsert = products.map(p => ({
    business_id: business.id,
    name: p.name || p.Name || "Unnamed Product",
    code: p.code || p.Code || p.sku || p.SKU || null,
    description: p.description || p.Description || null,
    category: p.category || p.Category || null,
    unit_price: parseFloat(p.price || p.Price || p.unit_price || p.unit_price) || 0,
    currency: p.currency || p.Currency || "USD",
    unit_type: p.unit || p.Unit || p.unit_type || "Piece",
    is_active: true
  }));

  await prisma.products.createMany({
    data: productsToInsert
  });
  
  revalidatePath("/products");
  return { success: true, count: productsToInsert.length };
}

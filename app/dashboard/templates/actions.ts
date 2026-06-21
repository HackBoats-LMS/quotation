"use server";

import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";
import { getLoggedInOwnerEmail, getBusinessProfile } from "@/app/auth/actions";

export async function getTemplates(businessId?: string) {
  let finalBusinessId = businessId;

  if (!finalBusinessId) {
    const email = await getLoggedInOwnerEmail();
    if (!email) throw new Error("Unauthorized");

    const business = await getBusinessProfile(email);
    if (!business) return [];
    finalBusinessId = business.id;
  }

  const { data, error } = await supabase
    .from("quotation_templates")
    .select("*")
    .eq("business_id", finalBusinessId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return data || [];
}

export async function uploadTemplate(formData: FormData) {
  const email = await getLoggedInOwnerEmail();
  if (!email) {
    return { success: false, error: "Unauthorized access." };
  }

  const business = await getBusinessProfile(email);
  if (!business) {
    return { success: false, error: "Business profile not found." };
  }

  const file = formData.get("file") as File;
  const name = formData.get("name") as string;

  if (!file || !name || !name.trim()) {
    return { success: false, error: "Please provide both a template name and a PDF file." };
  }

  try {
    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Setup local storage directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
    await fs.mkdir(uploadDir, { recursive: true });

    // Build unique filename
    const safeName = name.trim().replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const filename = `${Date.now()}_${safeName}.pdf`;
    const filepath = path.join(uploadDir, filename);

    // Save PDF file to filesystem
    await fs.writeFile(filepath, buffer);
    const pdfPath = `/uploads/templates/${filename}`;

    // Save metadata to database
    const { error } = await supabase
      .from("quotation_templates")
      .insert([
        {
          name: name.trim(),
          pdf_path: pdfPath,
          business_id: business.id,
        }
      ]);

    if (error) {
      console.error("Database template error:", error);
      // Clean up orphaned file
      await fs.unlink(filepath).catch(() => {});
      return { success: false, error: error.message || "Failed to save template to database." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (err) {
    console.error("Template upload crash:", err);
    return { success: false, error: "An unexpected error occurred during upload." };
  }
}

export async function deleteTemplate(id: string) {
  const email = await getLoggedInOwnerEmail();
  if (!email) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    // Get file path before deleting record
    const { data: template, error: fetchError } = await supabase
      .from("quotation_templates")
      .select("pdf_path, business_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !template) {
      return { success: false, error: "Template not found." };
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from("quotation_templates")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database deletion error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Delete local file
    const filepath = path.join(process.cwd(), "public", template.pdf_path);
    await fs.unlink(filepath).catch((err) => {
      console.warn("Could not delete file from disk:", err);
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (err) {
    console.error("Template deletion error:", err);
    return { success: false, error: "Failed to delete template." };
  }
}

export async function getTemplateById(id: string, businessId?: string) {
  let finalBusinessId = businessId;

  if (!finalBusinessId) {
    const email = await getLoggedInOwnerEmail();
    if (!email) throw new Error("Unauthorized");
    const business = await getBusinessProfile(email);
    if (!business) throw new Error("Business profile not found");
    finalBusinessId = business.id;
  }

  const { data, error } = await supabase
    .from("quotation_templates")
    .select("*")
    .eq("id", id)
    .eq("business_id", finalBusinessId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching template by ID:", error);
    return null;
  }

  return data || null;
}

export async function saveTemplateMappings(id: string, mappings: any) {
  const email = await getLoggedInOwnerEmail();
  if (!email) {
    return { success: false, error: "Unauthorized access." };
  }

  const business = await getBusinessProfile(email);
  if (!business) {
    return { success: false, error: "Business profile not found." };
  }

  const { error } = await supabase
    .from("quotation_templates")
    .update({ 
      mappings,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) {
    console.error("Error saving template mappings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/editor/${id}`);
  return { success: true };
}

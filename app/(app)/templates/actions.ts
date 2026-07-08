"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function uploadBackgroundFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    if (!file || !fileName) return { success: false, error: "Missing file" };

    // Use service role key to bypass all RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.storage
      .from('templates')
      .upload(`backgrounds/${fileName}`, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabaseAdmin.storage
      .from('templates')
      .getPublicUrl(`backgrounds/${fileName}`);

    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteBackgroundFile(filePath: string) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.storage.from('templates').remove([filePath]);
    return { success: true };
  } catch (err: any) {
    console.error("Delete error:", err);
    return { success: false, error: err.message };
  }
}

export async function saveTemplateSettings({ 
  businessId, 
  templateId, 
  layout, 
  backgroundUrl 
}: { 
  businessId: string, 
  templateId?: string | null, 
  layout: string, 
  backgroundUrl: string 
}) {
  try {
    if (templateId) {
      // Update existing
      const existing = await prisma.quotation_templates.findUnique({ where: { id: templateId } });
      const currentMappings = (existing?.mappings as any) || {};
      
      await prisma.quotation_templates.update({
        where: { id: templateId },
        data: {
          mappings: {
            ...currentMappings,
            layout: layout,
            background_url: backgroundUrl
          }
        }
      });
    } else {
      // Create new
      await prisma.quotation_templates.create({
        data: {
          business_id: businessId,
          mappings: {
            name: "Default Template",
            layout: layout,
            background_url: backgroundUrl,
            canvas_data: {}
          }
        }
      });
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to save template:", err);
    return { success: false, error: err.message };
  }
}

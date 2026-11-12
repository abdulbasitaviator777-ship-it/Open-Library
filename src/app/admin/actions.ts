
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAdminClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Please log in.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return supabase;
}

export async function approveUpload(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) throw new Error("Missing upload ID.");

  const supabase = await getAdminClient();

  const { data: item, error: itemError } = await supabase
    .from("archive_items")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .eq("storage_bucket", "quarantine")
    .single();

  if (itemError || !item) {
    throw new Error("Pending upload not found.");
  }

  const destinationBucket =
    item.kind === "book"
      ? "books"
      : item.kind === "photo"
      ? "photos"
      : "videos";

  // Download the private quarantine file.
  const { data: file, error: downloadError } = await supabase.storage
    .from("quarantine")
    .download(item.storage_path);

  if (downloadError || !file) {
    throw new Error("Could not read the quarantined file.");
  }

  const originalName =
    item.storage_path.split("/").pop() || "archive-file";

  const destinationPath =
    `${item.user_id}/${crypto.randomUUID()}-${originalName}`;

  // Publish the file to its corresponding public bucket.
  const { error: uploadError } = await supabase.storage
    .from(destinationBucket)
    .upload(destinationPath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Publishing failed: ${uploadError.message}`);
  }

  // Mark the item as approved and public.
  const { error: updateError } = await supabase
    .from("archive_items")
    .update({
      status: "approved",
      visibility: "public",
      storage_bucket: destinationBucket,
      storage_path: destinationPath
    })
    .eq("id", id)
    .eq("status", "pending");

  if (updateError) {
    await supabase.storage
      .from(destinationBucket)
      .remove([destinationPath]);

    throw new Error(`Database update failed: ${updateError.message}`);
  }

  // Remove the private quarantine copy.
  await supabase.storage
    .from("quarantine")
    .remove([item.storage_path]);

  revalidatePath("/admin");
  revalidatePath("/books");
  revalidatePath("/photos");
  revalidatePath("/videos");

  redirect("/admin?moderation=approved");
}

export async function rejectUpload(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) throw new Error("Missing upload ID.");

  const supabase = await getAdminClient();

  const { data: item, error: itemError } = await supabase
    .from("archive_items")
    .select("id, storage_path, storage_bucket")
    .eq("id", id)
    .eq("status", "pending")
    .eq("storage_bucket", "quarantine")
    .single();

  if (itemError || !item) {
    throw new Error("Pending upload not found.");
  }

  const { error: updateError } = await supabase
    .from("archive_items")
    .update({
      status: "rejected",
      visibility: "private"
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(`Could not reject upload: ${updateError.message}`);
  }

  await supabase.storage
    .from("quarantine")
    .remove([item.storage_path]);

  revalidatePath("/admin");

  redirect("/admin?moderation=rejected");
}

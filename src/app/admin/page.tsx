
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { ModerationPanel } from "@/components/moderation-panel";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  const { count: books } = await supabase
    .from("archive_items")
    .select("*", { count: "exact", head: true })
    .eq("kind", "book")
    .eq("status", "approved");

  const { count: photos } = await supabase
    .from("archive_items")
    .select("*", { count: "exact", head: true })
    .eq("kind", "photo")
    .eq("status", "approved");

  const { count: videos } = await supabase
    .from("archive_items")
    .select("*", { count: "exact", head: true })
    .eq("kind", "video")
    .eq("status", "approved");

  const { data: pendingItems } = await supabase
    .from("archive_items")
    .select(
      "id, title, description, kind, created_at, user_id, storage_path, storage_bucket"
    )
    .eq("status", "pending")
    .eq("storage_bucket", "quarantine")
    .order("created_at", { ascending: false });

  const moderationItems = await Promise.all(
    (pendingItems || []).map(async (item) => {
      const { data } = await supabase.storage
        .from("quarantine")
        .createSignedUrl(item.storage_path, 600);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        kind: item.kind as "book" | "photo" | "video",
        created_at: item.created_at,
        user_id: item.user_id,
        signedUrl: data?.signedUrl || null
      };
    })
  );

  return (
    <main className="admin-layout">
      <div className="page-heading">
        <div className="eyebrow">CONTROL CENTRE</div>
        <h1>Admin dashboard.</h1>
        <p>
          Manage your archive, review submissions and
          control the website identity.
        </p>
      </div>

      <div className="admin-cards">
        <div className="admin-stat">
          <span>BOOKS</span>
          <strong>{books ?? 0}</strong>
        </div>

        <div className="admin-stat">
          <span>PHOTOS</span>
          <strong>{photos ?? 0}</strong>
        </div>

        <div className="admin-stat">
          <span>VIDEOS</span>
          <strong>{videos ?? 0}</strong>
        </div>

        <div className="admin-stat">
          <span>PENDING REVIEW</span>
          <strong>{moderationItems.length}</strong>
        </div>
      </div>

      <ModerationPanel items={moderationItems} />

      <SettingsForm />
    </main>
  );
}

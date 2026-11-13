
import { createClient } from "@/lib/supabase/server";
import {
  BookOpen,
  Image as ImageIcon,
  Clapperboard,
} from "lucide-react";
import type { MediaKind } from "@/lib/types";
import { PhotoGallery } from "@/components/photo-gallery";
import { ArchiveViewers } from "@/components/archive-viewers";

const meta: Record<
  MediaKind,
  { bucket: string; icon: typeof BookOpen; label: string }
> = {
  book: { bucket: "books", icon: BookOpen, label: "BOOK" },
  photo: { bucket: "photos", icon: ImageIcon, label: "PHOTO" },
  video: { bucket: "videos", icon: Clapperboard, label: "VIDEO" },
};

export async function ArchiveGrid({ kind }: { kind: MediaKind }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .eq("kind", kind)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Archive loading error:", error.message);
  }

  const items: any[] = data || [];
  const Icon = meta[kind].icon;

  if (items.length === 0) {
    return (
      <div className="archive-grid">
        <div className="empty-state">
          <Icon size={34} />
          <h3>Your collection starts here</h3>
          <p>
            No public {kind}s have been uploaded yet. Sign in to add the first
            one.
          </p>
        </div>
      </div>
    );
  }

  // Photos use public URLs and the dedicated masonry gallery.
  if (kind === "photo") {
    const photos = items.map((item) => {
      const bucket = item.storage_bucket || "photos";

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(item.storage_path);

      return {
        id: String(item.id),
        title: item.title || "Untitled photograph",
        description: item.description || "",
        category: item.category || "",
        url: publicData.publicUrl,
      };
    });

    return <PhotoGallery items={photos} />;
  }

  // Videos and PDFs use signed URLs and the original in-page viewers.
  const viewerItems = await Promise.all(
    items.map(async (item) => {
      const bucket = item.storage_bucket || meta[kind].bucket;

      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(item.storage_path, 3600);

      if (signedError) {
        console.error(
          `Could not create signed URL for ${item.title}:`,
          signedError.message
        );
      }

      return {
        id: String(item.id),
        title: item.title || "Untitled",
        description: item.description || null,
        kind,
        url: signedData?.signedUrl || "",
        fileName:
          item.storage_path?.split("/").pop() ||
          (kind === "video" ? "video" : "book.pdf"),
      };
    })
  );

  return <ArchiveViewers items={viewerItems} kind={kind} />;
}


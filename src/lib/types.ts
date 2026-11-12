export type MediaKind = "book" | "photo" | "video";
export type ArchiveItem = {
  id: string; title: string; description: string | null; kind: MediaKind;
  storage_path: string; cover_path: string | null; created_at: string;
  user_id: string; visibility: "public" | "private";
};

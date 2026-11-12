
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UploadCloud,
  FileImage,
  FileVideo,
  BookOpen,
  ShieldCheck
} from "lucide-react";

type Kind = "book" | "photo" | "video";

const FILE_RULES = {
  book: {
    types: [
      "application/pdf",
      "application/epub+zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    extensions: [".pdf", ".epub", ".doc", ".docx"],
    maxSize: 50 * 1024 * 1024
  },
  photo: {
    types: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSize: 10 * 1024 * 1024
  },
  video: {
    types: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: [".mp4", ".webm", ".mov"],
    maxSize: 100 * 1024 * 1024
  }
};

export function UploadForm() {
  const [kind, setKind] = useState<Kind>("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function validateFile(selected: File, selectedKind: Kind) {
    const rules = FILE_RULES[selectedKind];
    const extension = "." + (selected.name.split(".").pop() || "").toLowerCase();

    if (!rules.extensions.includes(extension)) {
      throw new Error("This file extension is not allowed.");
    }

    if (!rules.types.includes(selected.type)) {
      throw new Error("This file type is not allowed.");
    }

    if (selected.size > rules.maxSize) {
      throw new Error(
        `File is too large. Maximum size is ${Math.round(rules.maxSize / 1024 / 1024)} MB.`
      );
    }

    if (selected.size === 0) {
      throw new Error("The selected file is empty.");
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!file || !title.trim()) {
      setMessage("Please add a title and choose a file.");
      return;
    }

    setBusy(true);

    let uploadedPath: string | null = null;

    try {
      validateFile(file, kind);

      const supabase = createClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again before uploading.");
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("quarantine")
        .upload(path, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      uploadedPath = path;

      const { error: insertError } = await supabase
        .from("archive_items")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          kind,
          storage_path: path,
          storage_bucket: "quarantine",
          user_id: user.id,
          visibility: "private",
          status: "pending"
        });

      if (insertError) throw insertError;

      setTitle("");
      setDescription("");
      setFile(null);

      const input = document.getElementById(
        "upload-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      setMessage(
        "Upload received. Your file is private and waiting for Admin approval."
      );
    } catch (err: unknown) {
      if (uploadedPath) {
        const supabase = createClient();
        await supabase.storage
          .from("quarantine")
          .remove([uploadedPath]);
      }

      setMessage(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const accept = FILE_RULES[kind].extensions.join(",");

  return (
    <form className="upload-card" onSubmit={submit}>
      <div className="kind-switch">
        {(["book", "photo", "video"] as const).map((k) => (
          <button
            type="button"
            key={k}
            className={kind === k ? "kind-active" : ""}
            onClick={() => {
              setKind(k);
              setFile(null);
              setMessage("");

              const input = document.getElementById(
                "upload-file"
              ) as HTMLInputElement | null;

              if (input) input.value = "";
            }}
          >
            {k === "book" ? (
              <BookOpen />
            ) : k === "photo" ? (
              <FileImage />
            ) : (
              <FileVideo />
            )}
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      <label className="field-label">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your upload a title"
          maxLength={150}
          required
        />
      </label>

      <label className="field-label">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description (optional)"
          rows={3}
          maxLength={2000}
        />
      </label>

      <label className="drop-zone">
        <UploadCloud size={30} />
        <strong>
          {file ? file.name : "Choose a file to upload"}
        </strong>

        <span>
          {kind === "book"
            ? "PDF, EPUB, DOC or DOCX — maximum 50 MB"
            : kind === "photo"
            ? "JPG, PNG or WEBP — maximum 10 MB"
            : "MP4, WEBM or MOV — maximum 100 MB"}
        </span>

        <input
          id="upload-file"
          type="file"
          accept={accept}
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setMessage("");

            if (selected) {
              try {
                validateFile(selected, kind);
                setFile(selected);
              } catch (error) {
                setFile(null);
                e.target.value = "";
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Invalid file."
                );
              }
            } else {
              setFile(null);
            }
          }}
          required
        />
      </label>

      <div className="notice">
        <ShieldCheck size={18} />
        Your upload will remain private until an Admin reviews and approves it.
      </div>

      <button
        disabled={busy}
        className="button button-jade full"
        type="submit"
      >
        {busy ? "Uploading..." : "Submit for Review"}
      </button>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}


"use client";

import { useState } from "react";
import {
  BookOpen,
  Image as ImageIcon,
  Clapperboard,
  X,
  Download,
  ExternalLink
} from "lucide-react";

type MediaKind = "book" | "photo" | "video";

type ArchiveItem = {
  id: string;
  title: string;
  description: string | null;
  kind: MediaKind;
  url: string;
  fileName: string;
};

function isPdf(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf");
}

export function ArchiveGridClient({ items }: { items: ArchiveItem[] }) {
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  function closePreview() {
    setSelected(null);
  }

  return (
    <>
      <div className="archive-grid">
        {items.map((item) => (
          <article
            className={`archive-card ${item.kind}-card`}
            key={item.id}
          >
            <button
              type="button"
              className="archive-preview-trigger"
              onClick={() => setSelected(item)}
              aria-label={`Preview ${item.title}`}
            >
              <div className="archive-visual">
                {item.kind === "photo" && item.url ? (
                  <img src={item.url} alt={item.title} />
                ) : item.kind === "video" ? (
                  <div className="video-poster">
                    <Clapperboard size={34} />
                    <span>NOW SHOWING</span>
                  </div>
                ) : (
                  <div className="book-cover">
                    <BookOpen size={34} />
                    <span>VERDANT<br />LIBRARY</span>
                  </div>
                )}

                <span className="item-tag">
                  {item.kind.toUpperCase()}
                </span>

                <span className="archive-open-hint">
                  Open Preview
                </span>
              </div>
            </button>

            <div className="archive-card-body">
              <h3>{item.title}</h3>
              <p>
                {item.description || "A new addition to the archive."}
              </p>

              <button
                type="button"
                className="text-link archive-view-button"
                onClick={() => setSelected(item)}
              >
                {item.kind === "book"
                  ? "Read Book"
                  : item.kind === "video"
                    ? "Watch Video"
                    : "View Photo"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="archive-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
        >
          <div className="archive-modal-content">
            <div className="archive-modal-header">
              <div>
                <span className="eyebrow">
                  {selected.kind.toUpperCase()} PREVIEW
                </span>
                <h2>{selected.title}</h2>
              </div>

              <button
                type="button"
                className="archive-modal-close"
                onClick={closePreview}
                aria-label="Close preview"
              >
                <X size={23} />
              </button>
            </div>

            <div className="archive-modal-body">
              {!selected.url ? (
                <p>Preview is currently unavailable.</p>
              ) : selected.kind === "photo" ? (
                <img
                  className="archive-modal-image"
                  src={selected.url}
                  alt={selected.title}
                />
              ) : selected.kind === "video" ? (
                <video
                  className="archive-modal-video"
                  src={selected.url}
                  controls
                  autoPlay
                  playsInline
                >
                  Your browser does not support video playback.
                </video>
              ) : isPdf(selected.fileName) ? (
                <iframe
                  className="archive-modal-pdf"
                  src={`${selected.url}#toolbar=1&navpanes=0`}
                  title={selected.title}
                />
              ) : (
                <div className="archive-document-message">
                  <BookOpen size={42} />
                  <h3>Document Preview</h3>
                  <p>
                    This file format cannot be displayed directly in every
                    browser. You can download it to read on your device.
                  </p>
                  <a
                    href={selected.url}
                    download={selected.fileName}
                    className="button button-jade"
                  >
                    <Download size={17} />
                    Download Book
                  </a>
                </div>
              )}
            </div>

            {selected.description && (
              <p className="archive-modal-description">
                {selected.description}
              </p>
            )}

            {selected.url && (
              <div className="archive-modal-footer">
                <a
                  href={selected.url}
                  download={selected.fileName}
                  className="text-link"
                >
                  <Download size={16} />
                  Download
                </a>

                <button
                  type="button"
                  className="text-link"
                  onClick={closePreview}
                >
                  <X size={16} />
                  Close Preview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

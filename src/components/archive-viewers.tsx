
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Image as ImageIcon,
  Clapperboard,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  ListVideo,
  RotateCcw
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import type { MediaKind } from "@/lib/types";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ArchiveItem = {
  id: string;
  title: string;
  description: string | null;
  kind: MediaKind;
  url: string;
  fileName: string;
};

export function ArchiveViewers({
  items
}: {
  items: ArchiveItem[];
  kind?: MediaKind;
}) {
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  const closeViewer = () => setSelected(null);

  useEffect(() => {
    if (!selected) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="archive-grid">
        {items.map((item) => (
          <article className={`archive-card ${item.kind}-card`} key={item.id}>
            <button
              type="button"
              className="archive-preview-trigger"
              onClick={() => setSelected(item)}
            >
              <div className="archive-visual">
                {item.kind === "photo" && item.url ? (
                  <img src={item.url} alt={item.title} />
                ) : item.kind === "video" ? (
                  <div className="video-poster">
                    <Clapperboard size={36} />
                    <span>NOW SHOWING</span>
                  </div>
                ) : (
                  <div className="book-cover">
                    <BookOpen size={36} />
                    <span>VERDANT<br />LIBRARY</span>
                  </div>
                )}
                <span className="item-tag">{item.kind.toUpperCase()}</span>
                <span className="archive-open-hint">Open {item.kind}</span>
              </div>
            </button>

            <div className="archive-card-body">
              <h3>{item.title}</h3>
              <p>{item.description || "A new addition to the archive."}</p>
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
          className={`viewer-overlay ${selected.kind}-viewer-overlay`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <div className="viewer-shell">
            <header className="viewer-topbar">
              <div className="viewer-heading">
                {selected.kind === "video" ? (
                  <Clapperboard size={19} />
                ) : selected.kind === "photo" ? (
                  <ImageIcon size={19} />
                ) : (
                  <BookOpen size={19} />
                )}
                <div>
                  <strong>{selected.title}</strong>
                  <span>{selected.kind.toUpperCase()} VIEWER</span>
                </div>
              </div>

              <div className="viewer-top-actions">
                {selected.url && (
                  <a
                    href={selected.url}
                    download={selected.fileName}
                    className="viewer-icon-button"
                    title="Download"
                  >
                    <Download size={18} />
                  </a>
                )}
                <button
                  type="button"
                  className="viewer-icon-button"
                  onClick={closeViewer}
                  title="Close viewer"
                >
                  <X size={21} />
                </button>
              </div>
            </header>

            {selected.kind === "video" && (
              <VideoViewer
                items={items.filter((item) => item.kind === "video")}
                selected={selected}
                onSelect={setSelected}
              />
            )}

            {selected.kind === "photo" && (
              <PhotoViewer item={selected} />
            )}

            {selected.kind === "book" && (
              <PdfBookViewer item={selected} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- VIDEO PLAYER + PLAYLIST ---------------- */

function VideoViewer({
  items,
  selected,
  onSelect
}: {
  items: ArchiveItem[];
  selected: ArchiveItem;
  onSelect: (item: ArchiveItem) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const currentIndex = items.findIndex((item) => item.id === selected.id);

  function playNext() {
    if (currentIndex >= 0 && currentIndex < items.length - 1) {
      onSelect(items[currentIndex + 1]);
    }
  }

  function playPrevious() {
    if (currentIndex > 0) {
      onSelect(items[currentIndex - 1]);
    }
  }

  useEffect(() => {
    videoRef.current?.load();
    videoRef.current?.play().catch(() => {});
  }, [selected.id]);

  return (
    <div className={`video-viewer-layout ${showPlaylist ? "" : "playlist-collapsed"}`}>
      <main className="video-main">
        <div className="video-player-stage">
          {selected.url ? (
            <video
              key={selected.id}
              ref={videoRef}
              className="professional-video-player"
              src={selected.url}
              controls
              autoPlay
              playsInline
              onEnded={playNext}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <p className="viewer-error">Video is unavailable.</p>
          )}
        </div>

        <div className="video-information">
          <h2>{selected.title}</h2>
          <p>
            {selected.description || "A video from the Verdant Archive."}
          </p>

          <div className="video-navigation">
            <button
              type="button"
              onClick={playPrevious}
              disabled={currentIndex <= 0}
            >
              <ChevronLeft size={17} /> Previous
            </button>
            <span>
              {currentIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={playNext}
              disabled={currentIndex < 0 || currentIndex >= items.length - 1}
            >
              Next <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </main>

      <aside className={`video-playlist ${showPlaylist ? "" : "playlist-hidden"}`}>
        <div className="playlist-heading">
          <div>
            <ListVideo size={19} />
            <strong>Playlist</strong>
          </div>
          <span>{items.length} videos</span>
        </div>

        <div className="playlist-items">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`playlist-item ${item.id === selected.id ? "active" : ""}`}
              onClick={() => onSelect(item)}
            >
              <span className="playlist-number">
                {item.id === selected.id ? "▶" : index + 1}
              </span>
              <span className="playlist-video-icon">
                <Clapperboard size={19} />
              </span>
              <span className="playlist-item-text">
                <strong>{item.title}</strong>
                <small>{item.description || "Verdant Archive"}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <button
        type="button"
        className="mobile-playlist-toggle"
        onClick={() => setShowPlaylist((value) => !value)}
      >
        <ListVideo size={17} />
        {showPlaylist ? "Hide playlist" : "Show playlist"}
      </button>
    </div>
  );
}

/* ---------------- PHOTO VIEWER ---------------- */

function PhotoViewer({ item }: { item: ArchiveItem }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  function resetPhoto() {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  function changeZoom(amount: number) {
    setZoom((current) => {
      const next = Math.min(5, Math.max(0.25, current + amount));
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 0.15 : -0.15);
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      px: position.x,
      py: position.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPosition({
      x: dragStart.current.px + event.clientX - dragStart.current.x,
      y: dragStart.current.py + event.clientY - dragStart.current.y
    });
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await stageRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  useEffect(() => {
    const handleFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  return (
    <div className="photo-viewer">
      <div className="photo-toolbar">
        <div className="photo-zoom-controls">
          <button type="button" onClick={() => changeZoom(-0.25)} title="Zoom out">
            <ZoomOut size={19} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(0.25)} title="Zoom in">
            <ZoomIn size={19} />
          </button>
          <button type="button" onClick={resetPhoto} title="Fit to screen">
            <RotateCcw size={18} />
            <span>Fit</span>
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          title="Fullscreen"
          className="photo-fullscreen-button"
        >
          {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
        </button>
      </div>

      <div
        className="photo-stage"
        ref={stageRef}
        onWheel={handleWheel}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
      >
        {item.url ? (
          <img
            src={item.url}
            alt={item.title}
            draggable={false}
            className="photo-stage-image"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
            }}
          />
        ) : (
          <p className="viewer-error">Image is unavailable.</p>
        )}
      </div>

      {item.description && (
        <div className="photo-caption">{item.description}</div>
      )}
    </div>
  );
}

/* ---------------- PDF BOOK READER ---------------- */


function PdfBookViewer({ item }: { item: ArchiveItem }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [doublePage, setDoublePage] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const readerRef = useRef<HTMLDivElement>(null);

  const pageWidth = Math.round(430 * (zoom / 100));
  const secondPage = doublePage && page < numPages ? page + 1 : null;

  useEffect(() => {
    setPage(1);
    setNumPages(0);
    setZoom(100);
    setError("");
  }, [item.id]);

  const thumbnails = useMemo(
    () => Array.from({ length: numPages }, (_, index) => index + 1),
    [numPages]
  );

  function previousPage() {
    setPage((current) => Math.max(1, current - (doublePage ? 2 : 1)));
  }

  function nextPage() {
    setPage((current) =>
      Math.min(numPages, current + (doublePage ? 2 : 1))
    );
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await readerRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    const handleFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  return (
    <div className="book-reader" ref={readerRef}>
      <div className="book-toolbar">
        <div className="book-toolbar-group">
          <button
            type="button"
            onClick={() => setShowThumbnails((value) => !value)}
            title="Toggle page thumbnails"
          >
            <BookOpen size={18} />
            <span>Pages</span>
          </button>

          <button
            type="button"
            onClick={() => setDoublePage((value) => !value)}
            className={doublePage ? "active" : ""}
          >
            <span>{doublePage ? "Two Pages" : "Single Page"}</span>
          </button>
        </div>

        <div className="book-toolbar-group">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(50, value - 10))}
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="book-zoom-value">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(160, value + 10))}
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button type="button" onClick={() => setZoom(100)} title="Reset zoom">
            <RotateCcw size={17} />
          </button>
          <button type="button" onClick={toggleFullscreen} title="Fullscreen">
            {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {error ? (
        <div className="book-error">
          <BookOpen size={40} />
          <h3>Unable to open this PDF</h3>
          <p>{error}</p>
          <a href={item.url} download={item.fileName}>Download PDF</a>
        </div>
      ) : (
        <Document
          file={item.url}
          onLoadSuccess={({ numPages: total }) => {
            setNumPages(total);
            setPage(1);
            setError("");
          }}
          onLoadError={(loadError) => setError(loadError.message)}
          loading={<div className="book-loading">Opening your book…</div>}
          error={<div className="book-loading">Could not load this PDF.</div>}
        >
          <div className="book-reader-layout">
            {showThumbnails && (
              <aside className="book-thumbnails">
                <div className="thumbnail-heading">PAGE THUMBNAILS</div>

                {thumbnails.map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={`book-thumbnail ${
                      pageNumber >= page &&
                      pageNumber <= (secondPage || page)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={105}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                    <span>{pageNumber}</span>
                  </button>
                ))}
              </aside>
            )}

            <main className="book-pages-area">
              <div className={`book-page-spread ${doublePage ? "two-page" : ""}`}>
                <div className="book-page">
                  <Page
                    pageNumber={page}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<div className="book-loading">Loading page…</div>}
                  />
                </div>

                {secondPage && (
                  <div className="book-page">
                    <Page
                      pageNumber={secondPage}
                      width={pageWidth}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<div className="book-loading">Loading page…</div>}
                    />
                  </div>
                )}
              </div>
            </main>
          </div>
        </Document>
      )}

      <footer className="book-navigation">
        <button type="button" onClick={previousPage} disabled={page <= 1}>
          <ChevronLeft size={18} /> Previous
        </button>

        <div className="book-page-jump">
          <span>Page</span>
          <input
            type="number"
            min={1}
            max={numPages || 1}
            value={page}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value >= 1 && value <= numPages) setPage(value);
            }}
          />
          <span>of {numPages || "—"}</span>
        </div>

        <button
          type="button"
          onClick={nextPage}
          disabled={!numPages || page >= numPages}
        >
          Next <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}

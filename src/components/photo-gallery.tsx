
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
} from "lucide-react";

type PhotoItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  url: string;
};

export function PhotoGallery({ items }: { items: PhotoItem[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        items
          .map((item) => item.category?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
    return ["All", ...values];
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        (item.description || "").toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term);

      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const selectedPhoto =
    selectedIndex === null ? null : filteredItems[selectedIndex] || null;

  const closeViewer = useCallback(() => {
    setSelectedIndex(null);
    setZoom(1);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || filteredItems.length === 0) return current;
      return (current - 1 + filteredItems.length) % filteredItems.length;
    });
    setZoom(1);
  }, [filteredItems.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || filteredItems.length === 0) return current;
      return (current + 1) % filteredItems.length;
    });
    setZoom(1);
  }, [filteredItems.length]);

  useEffect(() => {
    if (selectedIndex !== null && !selectedPhoto) {
      closeViewer();
    }
  }, [selectedIndex, selectedPhoto, closeViewer]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, closeViewer, showPrevious, showNext]);

  function toggleFavorite(id: string) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function enterFullscreen() {
    const element = document.querySelector(".photo-gallery-viewer");
    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be unavailable in some browsers.
    }
  }

  return (
    <section className="photo-gallery-page">
      <div className="photo-gallery-heading">
        <div>
          <span className="photo-gallery-eyebrow">THE VISUAL ARCHIVE</span>
          <h1>Explore Photography</h1>
          <p>
            Discover moments, places and stories captured through photography.
          </p>
        </div>
        <div className="photo-gallery-count">
          <ImageIcon size={17} />
          <span>{filteredItems.length} photographs</span>
        </div>
      </div>

      <div className="photo-gallery-search">
        <Search size={20} />
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedIndex(null);
          }}
          placeholder="Search photographs..."
          aria-label="Search photographs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {categories.length > 1 && (
        <div className="photo-gallery-categories" aria-label="Photo categories">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => {
                setActiveCategory(category);
                setSelectedIndex(null);
              }}
            >
              {category === "All" ? "All photos" : category}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="photo-masonry">
          {filteredItems.map((photo, index) => (
            <article className="photo-masonry-card" key={photo.id}>
              <button
                type="button"
                className="photo-masonry-open"
                onClick={() => {
                  setSelectedIndex(index);
                  setZoom(1);
                }}
                aria-label={`View ${photo.title}`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="photo-masonry-image"
                />
                <span className="photo-masonry-overlay">
                  <span className="photo-masonry-title">{photo.title}</span>
                  <span className="photo-masonry-action">View photograph</span>
                </span>
              </button>

              <div className="photo-masonry-details">
                <div>
                  <h2>{photo.title}</h2>
                  {photo.category && <span>{photo.category}</span>}
                </div>
                <button
                  type="button"
                  className={`photo-favorite-button ${
                    favorites.includes(photo.id) ? "is-favorite" : ""
                  }`}
                  onClick={() => toggleFavorite(photo.id)}
                  aria-label={
                    favorites.includes(photo.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  title="Favorite"
                >
                  <Heart
                    size={19}
                    fill={
                      favorites.includes(photo.id) ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="photo-gallery-empty">
          <ImageIcon size={38} />
          <h2>No photographs found</h2>
          <p>
            {items.length === 0
              ? "Approved photographs will appear here when they are added to your archive."
              : "Try another search term or select a different category."}
          </p>
          {(search || activeCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="photo-gallery-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Photograph viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <header className="photo-viewer-topbar">
            <div className="photo-viewer-heading">
              <span className="photo-viewer-mark">
                <ImageIcon size={19} />
              </span>
              <div>
                <strong>{selectedPhoto.title}</strong>
                <small>
                  {(selectedIndex ?? 0) + 1} of {filteredItems.length}
                </small>
              </div>
            </div>

            <div className="photo-viewer-tools">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(value + 0.25, 3))}
                disabled={zoom >= 3}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn size={19} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(value - 0.25, 0.5))}
                disabled={zoom <= 0.5}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut size={19} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <RotateCcw size={18} />
              </button>
              <a
                href={selectedPhoto.url}
                   download
                aria-label="Download photograph"
                title="Download"
              >
                <Download size={19} />
              </a>
              <button
                type="button"
                onClick={enterFullscreen}
                aria-label="Toggle fullscreen"
                title="Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
              <button
                type="button"
                className="photo-viewer-close"
                onClick={closeViewer}
                aria-label="Close viewer"
                title="Close"
              >
                <X size={21} />
              </button>
            </div>
          </header>

          <button
            type="button"
            className="photo-viewer-nav photo-viewer-prev"
            onClick={showPrevious}
            aria-label="Previous photograph"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="photo-viewer-stage">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              style={{ transform: `scale(${zoom})` }}
              className="photo-viewer-image"
            />
          </div>

          <button
            type="button"
            className="photo-viewer-nav photo-viewer-next"
            onClick={showNext}
            aria-label="Next photograph"
          >
            <ChevronRight size={28} />
          </button>

          <footer className="photo-viewer-caption">
            <div>
              <strong>{selectedPhoto.title}</strong>
              {selectedPhoto.description && (
                <p>{selectedPhoto.description}</p>
              )}
            </div>
            <span>{Math.round(zoom * 100)}% zoom</span>
          </footer>
        </div>
      )}
    </section>
  );
}

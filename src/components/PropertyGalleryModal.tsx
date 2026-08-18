"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface GalleryMediaItem {
  type: "image" | "video";
  url: string;
}

interface PropertyGalleryModalProps {
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  media: GalleryMediaItem[];
  propertyTitle: string;
}

export function PropertyGalleryModal({
  isOpen,
  initialIndex = 0,
  onClose,
  media,
  propertyTitle,
}: PropertyGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update active index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % media.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, media.length, onClose]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!isOpen) return;
    const activeThumb = thumbRefs.current[activeIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [isOpen, activeIndex]);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[activeIndex] || media[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % media.length);
  };

  return (
    <div
      className="gallery-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos — ${propertyTitle}`}
    >
      {/* Header bar with counter and close button */}
      <header className="gallery-modal-header" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-counter">
          <span>{activeIndex + 1} / {media.length}</span>
          {currentMedia?.type === "video" && <span className="gallery-modal-tag">Vídeo</span>}
        </div>
        <button
          type="button"
          className="gallery-modal-close"
          onClick={onClose}
          aria-label="Fechar galeria (Esc)"
        >
          <X size={22} />
        </button>
      </header>

      {/* Main stage with prev/next buttons and large media */}
      <div className="gallery-modal-stage" onClick={onClose}>
        {media.length > 1 && (
          <button
            type="button"
            className="gallery-modal-nav gallery-modal-nav--prev"
            onClick={handlePrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div className="gallery-modal-media-wrapper" onClick={(e) => e.stopPropagation()}>
          {currentMedia?.type === "image" ? (
            <img
              src={currentMedia.url}
              alt={`${propertyTitle} — foto ${activeIndex + 1}`}
              className="gallery-modal-img"
            />
          ) : (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              autoPlay
              playsInline
              className="gallery-modal-video"
            />
          )}
        </div>

        {media.length > 1 && (
          <button
            type="button"
            className="gallery-modal-nav gallery-modal-nav--next"
            onClick={handleNext}
            aria-label="Próxima foto"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Bottom thumbnail strip */}
      {media.length > 1 && (
        <footer className="gallery-modal-footer" onClick={(e) => e.stopPropagation()}>
          <div className="gallery-modal-strip">
            {media.map((item, index) => (
              <button
                key={`${item.type}-${item.url}-${index}`}
                ref={(el) => {
                  thumbRefs.current[index] = el;
                }}
                type="button"
                className={`gallery-modal-thumb ${index === activeIndex ? "gallery-modal-thumb--active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Exibir ${item.type === "video" ? "vídeo" : "foto"} ${index + 1}`}
              >
                {item.type === "image" ? (
                  <img src={item.url} alt="" />
                ) : (
                  <div className="gallery-modal-video-thumb">
                    <video src={item.url} muted preload="metadata" />
                    <span><Play size={14} /></span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}

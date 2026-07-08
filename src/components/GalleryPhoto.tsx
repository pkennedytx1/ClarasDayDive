import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { GalleryItem } from '@/lib/content';

type GalleryPhotoProps = {
  photo: GalleryItem;
  isOpen: boolean;
  onToggle: () => void;
};

export function GalleryPhoto({ photo, isOpen, onToggle }: GalleryPhotoProps) {
  const figureRef = useRef<HTMLElement>(null);
  const hasCaption = Boolean(photo.caption?.trim());

  useEffect(() => {
    if (!isOpen || !hasCaption) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!figureRef.current?.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, hasCaption, onToggle]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
    if (event.key === 'Escape' && isOpen) {
      onToggle();
    }
  };

  const frameClass = 'gallery-photo__frame';

  return (
    <figure
      ref={figureRef}
      className={`gallery-photo${isOpen ? ' is-open' : ''}${hasCaption ? ' has-caption' : ''}`}
    >
      {hasCaption ? (
        <button
          type="button"
          className={frameClass}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-label={`${photo.alt}. ${isOpen ? 'Hide caption' : 'Show caption'}`}
        >
          <img
            className="gallery-photo__img"
            src={photo.srcThumb}
            srcSet={`${photo.srcThumb} 480w, ${photo.src} 1600w`}
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 19rem, 78vw"
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
          />
        </button>
      ) : (
        <div className={frameClass}>
          <img
            className="gallery-photo__img"
            src={photo.srcThumb}
            srcSet={`${photo.srcThumb} 480w, ${photo.src} 1600w`}
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 19rem, 78vw"
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      {hasCaption && (
        <figcaption className="gallery-photo__caption">
          <p className="gallery-photo__caption-text">{photo.caption}</p>
        </figcaption>
      )}
    </figure>
  );
}

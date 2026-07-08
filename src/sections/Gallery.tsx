import { useState } from 'react';
import { GalleryPhoto } from '@/components/GalleryPhoto';
import { Reveal } from '@/components/Reveal';
import { getGalleryContent } from '@/lib/content';

export function Gallery() {
  const gallery = getGalleryContent();
  const [openSrc, setOpenSrc] = useState<string | null>(null);

  if (gallery.items.length === 0) return null;

  const handleToggle = (src: string) => {
    setOpenSrc((current) => (current === src ? null : src));
  };

  return (
    <section id="gallery" className="section section--gallery section--compact" aria-labelledby="gallery-heading">
      <div className="container gallery__head">
        <Reveal>
          <header className="section-head section-head--brand">
            <div>
              <p className="eyebrow eyebrow--teal">{gallery.eyebrow}</p>
              <h2 id="gallery-heading" className="display-lg">
                {gallery.title}
              </h2>
            </div>
          </header>
        </Reveal>
      </div>

      <div
        className="gallery-scroll"
        tabIndex={0}
        role="region"
        aria-label="Photo gallery — scroll sideways to see more"
      >
        <ul className="gallery-strip">
          {gallery.items.map((photo, i) => (
            <Reveal key={photo.src} stagger={i} delay={40}>
              <li className="gallery-strip__item">
                <GalleryPhoto
                  photo={photo}
                  isOpen={openSrc === photo.src}
                  onToggle={() => handleToggle(photo.src)}
                />
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

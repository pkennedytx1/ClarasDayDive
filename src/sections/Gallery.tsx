import { Reveal } from '@/components/Reveal';
import { getGalleryContent } from '@/lib/content';

export function Gallery() {
  const gallery = getGalleryContent();
  if (gallery.items.length === 0) return null;

  return (
    <section id="gallery" className="section section--gallery section--compact" aria-labelledby="gallery-heading">
      <div className="container">
        <div className="section-rail">
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

          <ul className="gallery-grid">
            {gallery.items.map((photo, i) => (
              <Reveal key={photo.src} stagger={i} delay={60}>
                <li className="gallery-item">
                  <figure className="gallery-item__figure">
                    <img
                      className="gallery-item__img"
                      src={photo.srcThumb}
                      srcSet={`${photo.srcThumb} 480w, ${photo.src} 1600w`}
                      sizes="(min-width: 768px) 33vw, 50vw"
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                    />
                    {photo.caption && (
                      <figcaption className="gallery-item__caption">{photo.caption}</figcaption>
                    )}
                  </figure>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

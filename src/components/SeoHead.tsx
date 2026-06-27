import { useEffect } from 'react';
import { buildJsonLd, getSeoMeta } from '@/lib/schema';

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
  includeSchema?: boolean;
}

const defaultMeta = getSeoMeta();
const defaultSchemas = buildJsonLd();

export function SeoHead({
  title = defaultMeta.title,
  description = defaultMeta.description,
  path = '/',
  includeSchema = true,
}: SeoHeadProps) {
  const canonicalUrl = `${defaultMeta.siteUrl}${path === '/' ? '' : path}`;

  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    if (includeSchema) setMeta('keywords', defaultMeta.keywords);
    setMeta('robots', 'index, follow, max-image-preview:large');
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:image', defaultMeta.ogImage, true);
    setMeta('og:locale', 'en_US', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', defaultMeta.ogImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.querySelectorAll('script[data-seo-schema]').forEach((n) => n.remove());
    if (includeSchema) {
      defaultSchemas.forEach((schema, i) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoSchema = String(i);
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [title, description, canonicalUrl, includeSchema]);

  return null;
}

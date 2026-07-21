import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const MAX_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 30_000;
const GALLERY_MAX_WIDTH = 1600;
const THUMB_MAX_WIDTH = 480;
const WEBP_QUALITY = 80;

export function normalizeImageUrl(url) {
  const raw = String(url).trim();
  const fileIdMatch =
    raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
  }
  return raw;
}

function photoSlug(imageUrl, usedSlugs) {
  const base = `photo-${stablePhotoId(imageUrl)}`;
  if (!usedSlugs.has(base)) {
    usedSlugs.add(base);
    return base;
  }

  let suffix = 2;
  while (usedSlugs.has(`${base}-${suffix}`)) suffix += 1;
  const slug = `${base}-${suffix}`;
  usedSlugs.add(slug);
  return slug;
}

export function stablePhotoId(imageUrl) {
  return createHash('sha256').update(normalizeImageUrl(imageUrl)).digest('hex').slice(0, 12);
}

async function fetchImageBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'ClarasDayDive-sync/1.0' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      throw new Error('URL returned HTML instead of an image (check sharing settings)');
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error(`image exceeds ${MAX_BYTES / (1024 * 1024)} MB limit`);
    }

    return buffer;
  } finally {
    clearTimeout(timer);
  }
}

async function writeOptimizedVariants(buffer, galleryDir, slug) {
  const fullPath = join(galleryDir, `${slug}.webp`);
  const thumbPath = join(galleryDir, `${slug}-thumb.webp`);

  await sharp(buffer)
    .rotate()
    .resize({
      width: GALLERY_MAX_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(fullPath);

  await sharp(buffer)
    .rotate()
    .resize({
      width: THUMB_MAX_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(thumbPath);

  const fullMeta = await sharp(fullPath).metadata();

  return {
    width: fullMeta.width ?? GALLERY_MAX_WIDTH,
    height: fullMeta.height ?? GALLERY_MAX_WIDTH,
  };
}

function cleanupOrphans(galleryDir, keepSlugs) {
  if (!existsSync(galleryDir)) return;

  const keep = new Set();
  for (const slug of keepSlugs) {
    keep.add(`${slug}.webp`);
    keep.add(`${slug}-thumb.webp`);
  }

  for (const name of readdirSync(galleryDir)) {
    if (!name.endsWith('.webp') && name !== '.gitkeep') continue;
    if (name === '.gitkeep') continue;
    if (!keep.has(name)) {
      unlinkSync(join(galleryDir, name));
    }
  }
}

/**
 * @param {object} opts
 * @param {Array<object>} opts.rows Active photo rows sorted by sort_order
 * @param {object} opts.settings _Settings map
 * @param {string} opts.galleryDir Absolute path to public/assets/gallery
 * @param {string[]} opts.errors
 */
export async function buildGalleryJson({ rows, settings, galleryDir, errors }) {
  mkdirSync(galleryDir, { recursive: true });

  const eyebrow = settings.gallery_eyebrow?.trim() || 'The vibe';
  const title = settings.gallery_title?.trim() || 'Photos';
  const items = [];
  const slugs = [];
  const usedSlugs = new Set();

  for (const row of rows) {
    const slug = photoSlug(String(row.image_url).trim(), usedSlugs);

    const imageUrl = normalizeImageUrl(row.image_url);
    let buffer;
    try {
      buffer = await fetchImageBytes(imageUrl);
    } catch (err) {
      errors.push(`Photos row ${row._row}: could not download image — ${err.message}`);
      continue;
    }

    try {
      const { width, height } = await writeOptimizedVariants(buffer, galleryDir, slug);
      slugs.push(slug);
      const item = {
        src: `/assets/gallery/${slug}.webp`,
        srcThumb: `/assets/gallery/${slug}-thumb.webp`,
        width,
        height,
        alt: String(row.alt_text).trim(),
      };

      const caption = String(row.caption ?? '').trim();
      if (caption) item.caption = caption;

      items.push(item);
    } catch (err) {
      errors.push(`Photos row ${row._row}: image optimization failed — ${err.message}`);
    }
  }

  cleanupOrphans(galleryDir, slugs);

  return { eyebrow, title, items };
}

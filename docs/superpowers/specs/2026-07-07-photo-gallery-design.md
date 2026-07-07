# Photo Gallery — Client-Managed with Build-Time Optimization

**Date:** 2026-07-07  
**Status:** Approved in principle — pending spec review  
**Goal:** Let staff add, remove, and reorder venue photos via Google Sheets (with Google Drive as the upload inbox), serve optimized WebP images from the static site, and meet accessibility requirements.

---

## 1. Overview

Clients upload photos to a shared **Google Drive folder**, then register each image in a new **`Photos`** sheet tab with alt text, optional caption, sort order, and active flag. On publish, `sync-from-sheets.mjs` downloads each URL, optimizes with **sharp** at build time, writes files to `public/assets/gallery/`, and emits `src/content/gallery.json`.

The site renders a new **Gallery** section on the homepage with lazy-loaded responsive images.

**In scope:**
- `Photos` sheet tab + CSV template
- Drive URL normalization (and other public HTTPS URLs)
- Build-time download, resize, WebP conversion
- `gallery.json` + React section + nav anchor
- Section copy in `_Settings` (`gallery_eyebrow`, `gallery_title`)
- Sync validation and error messages
- Docs for staff workflow

**Out of scope (v1):**
- Apps Script “import from Drive folder” button
- S3 upload UI or runtime image CDN
- Lightbox / modal (can add in v1.1 if desired)
- Gallery images in JSON-LD schema (optional follow-up)

---

## 2. Client Workflow

1. Upload photos to shared folder: **Clara's Day Dive — Site Photos** (Google Drive).
2. For each photo: **Share → Anyone with the link → Viewer**, copy link.
3. In the **`Photos`** tab, add a row:

   | sort_order | active | image_url | alt_text | caption |
   |------------|--------|-----------|----------|---------|
   | 1 | TRUE | https://drive.google.com/file/d/… | Patrons on the patio at golden hour | Optional short caption |

4. Set `sort_order` to control display order (lower = first).
5. Set `active` to `FALSE` to hide without deleting the row.
6. Click **Publish site** (existing flow).

**Staff rules (documented in sheets-template README):**
- `alt_text` is **required** — describe what's in the photo for screen readers and SEO.
- Prefer landscape photos ≥ 1200px wide; build step will downscale.
- Supported sources: Google Drive share links, direct `https://` URLs (Instagram CDN, etc.).

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Google Drive folder (upload inbox — not synced directly)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ staff copies share links
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Google Sheets — Photos tab                                     │
│  sort_order | active | image_url | alt_text | caption           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ sync-from-sheets.mjs
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  scripts/lib/optimize-gallery-images.mjs (sharp)              │
│  → public/assets/gallery/{slug}.webp (+ optional thumb)       │
│  → src/content/gallery.json                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ vite build → SST StaticSite
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  CloudFront / S3 — optimized static assets                      │
└─────────────────────────────────────────────────────────────────┘
```

**Why not sync the Drive folder directly:** ordering, alt text, and hide/show belong in the sheet. Drive is the upload destination only.

---

## 4. Google Sheets Content Model

### Tab: `Photos`

| Column | Required | Notes |
|--------|----------|-------|
| `sort_order` | Yes | Integer; lower appears first |
| `active` | Yes | `TRUE` / `FALSE` (same convention as other tabs) |
| `image_url` | Yes | Google Drive share URL or any public HTTPS image URL |
| `alt_text` | Yes | Short descriptive text for `alt` attribute |
| `caption` | No | Shown below image in gallery if present |

### `_Settings` keys (section copy)

| key | example |
|-----|---------|
| `gallery_eyebrow` | On the patio |
| `gallery_title` | A day at Clara's |

If no active photos exist after sync, the Gallery section is **omitted** from the page (no empty state).

---

## 5. Sync & Image Optimization

### New module: `scripts/lib/optimize-gallery-images.mjs`

Responsibilities:
1. Accept validated photo rows from sync.
2. Normalize `image_url` to a fetchable URL:
   - Drive `/file/d/{id}/view` → `https://drive.google.com/uc?export=download&id={id}`
   - Drive `open?id={id}` → same
   - Pass through other `https://` URLs unchanged
3. Download image bytes (with timeout and size cap, e.g. 15 MB).
4. Process with **sharp**:
   - **Gallery size:** max width 1600px, maintain aspect ratio, WebP quality ~80
   - **Thumb size:** max width 480px (for grid / future srcset)
   - Strip EXIF orientation; reject non-image MIME types
5. Write outputs:
   - `public/assets/gallery/{id}.webp` (full)
   - `public/assets/gallery/{id}-thumb.webp` (thumb)
6. `{id}` = stable slug from row index + hash of source URL (or sequential `photo-01`, `photo-02` from sort_order) so unchanged URLs reuse filenames and git diffs stay readable.

### Output: `src/content/gallery.json`

```json
{
  "eyebrow": "On the patio",
  "title": "A day at Clara's",
  "items": [
    {
      "src": "/assets/gallery/photo-01.webp",
      "srcThumb": "/assets/gallery/photo-01-thumb.webp",
      "width": 1600,
      "height": 1067,
      "alt": "Patrons on the patio at golden hour",
      "caption": "Summer evenings on the patio"
    }
  ]
}
```

Dimensions come from sharp metadata after resize.

### Cache / cleanup

- Before writing, remove gallery files in `public/assets/gallery/` that are **not** referenced by the current sync output (orphan cleanup).
- If download or optimization fails for a row, sync **fails** with a clear row-level error (same pattern as other tabs).
- Add `public/assets/gallery/.gitkeep` so the directory exists in repo.

### Dependencies

- Add `sharp` as a **devDependency** (build-time only).

### Service account / CI

- Google Drive download via `uc?export=download` works for **anyone-with-link** files without Drive API scopes (HTTP fetch only).
- No new Google API permissions required for v1.

---

## 6. Frontend

### New section: `src/sections/Gallery.tsx`

- Pattern matches `WhatsHere.tsx`: `getGalleryContent()` from `content.ts`, `Reveal` animations, BEM classes in `sections.css`.
- CSS grid: 2 columns mobile, 3 columns desktop; consistent aspect ratio via `object-fit: cover`.
- Each `<img>`:
  - `src={item.srcThumb}` or `src={item.src}` with `srcSet` for 480w / 1600w
  - `alt={item.alt}` (required — never empty in JSON)
  - `loading="lazy"`, `decoding="async"`, explicit `width` / `height`
  - Optional `<figcaption>` when `caption` is set
- Section `id="gallery"`, `aria-labelledby="gallery-heading"`.

### Page integration

- Insert `<Gallery />` after `WhatsHere`, before `Events` (venue photos before upcoming events).
- Add nav link in default nav / `site.json`: `{ "label": "Photos", "href": "#gallery" }`.
- Add `#gallery` to `SECTION_IDS` in `HomePage.tsx`.
- Conditionally render: if `gallery.items.length === 0`, return `null`.

### Section copy source

- `eyebrow` / `title` from `gallery.json` (synced from `_Settings`).
- Fallbacks if keys missing: eyebrow `"The vibe"`, title `"Photos"`.

---

## 7. Validation Rules (sync)

| Rule | Error |
|------|-------|
| Missing `image_url` on active row | Required field error |
| Missing `alt_text` on active row | Required field error |
| Invalid / unreachable URL | Row-level fetch error |
| File too large | Row-level size error |
| Not an image | Row-level MIME error |
| Inactive rows | Skipped (no download) |

Inactive rows with empty optional fields: allowed (same as optional settings pattern).

---

## 8. Testing

- **Unit-style script tests** (inline or small test file): Drive URL normalization, slug generation.
- **Manual:** Add 2–3 rows in sheet with Drive links → `npm run sync:content` → verify WebP files and `gallery.json`.
- **Manual:** Set all rows `active=FALSE` → section hidden on dev server.
- **Manual:** Reorder via `sort_order` → confirm grid order matches.
- **a11y:** Every gallery img has non-empty alt; run existing `check-a11y.mjs` (no change required unless we add gallery to HTML snapshot checks later).

---

## 9. Documentation Updates

- `docs/sheets-template/csv/Photos.csv` — sample rows
- `docs/sheets-template/README.md` — Photos tab + Drive workflow
- `docs/sheets-setup.md` — add Photos to tab list
- `docs/sheets-template/csv/_Settings.csv` — add gallery_eyebrow, gallery_title

---

## 10. Future Enhancements (not v1)

| Enhancement | Benefit |
|-------------|---------|
| Apps Script `ImportPhotosFromFolder` | Auto-populate rows from Drive folder; staff still edit alt/order |
| Lightbox on click | Full-size viewing without new tab |
| JSON-LD `image` array | Richer SEO from gallery photos |
| AVIF output | Smaller files; add when browser support is acceptable |

---

## 11. Recommendation Summary

| Decision | Choice |
|----------|--------|
| Upload inbox | Google Drive folder (manual link paste) |
| Source of truth | `Photos` sheet tab |
| Optimization | **Option A** — sharp at build time |
| Hosting | `public/assets/gallery/` → SST static site |
| Alt text | Required column in sheet |
| Ordering | `sort_order` column |

This extends the existing Sheets → sync → JSON → React pipeline without new AWS resources.

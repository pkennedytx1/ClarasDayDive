# Sheets Template — Column Headers

Use this reference when creating **Clara's Day Dive — Site Content** in Google Sheets. Copy each header row into **row 1** of the matching tab. Tab names are **case-sensitive**.

> This folder is documentation only — it does not create or host a Google Sheet. See [sheets-setup.md](../sheets-setup.md) for service account access, env vars, and publish workflow.

---

## Workbook tabs (9 total — 7 required + 2 optional)

| Tab name | Purpose |
|----------|---------|
| `_Settings` | Site copy, contact, SEO, Ask Clara labels |
| `Hours` | Opening hours (footer + schema) |
| `Drinks` | Menu items and filter categories |
| `Events` | Upcoming events and calendar |
| `WhatsHere` | "What's here" feature cards |
| `Photos` | Gallery images (optional — section hidden when empty) |
| `FAQ` | Frequently asked questions (shown on site) |
| `AskClara` | Suggestion chips and canned replies |
| `Knowledge` | Ask Clara venue facts (restrooms, parking, etc.) — optional |

`legal.json` (privacy, terms) stays in the repo — **not** synced from the sheet.

---

## `_Settings`

**Row 1 headers:**

```
key | value
```

**Required keys** (one row per key, starting row 2):

| key | example value |
|-----|---------------|
| `site_name` | Clara's Day Dive |
| `tagline` | Dive in for a day drink. |
| `footer_tagline` | Dive in for a day drink. South Austin bar & patio. — line under the footer wordmark |
| `description` | A neighborhood coupe bar… |
| `hero_meta` | № 01 — Open till midnight, seven days |
| `location_eyebrow` | East Austin · Coupe bar & patio |
| `address` | 1814 E Cesar Chavez St |
| `city` | Austin, TX 78702 |
| `region` | TX |
| `postal_code` | 78702 |
| `country` | US |
| `instagram_url` | Optional — full profile URL; leave blank to hide icon |
| `facebook_url` | Optional — full profile URL; leave blank to hide icon |
| `tiktok_url` | Optional — full profile URL; leave blank to hide icon |
| `contact_name` | Your event coordinator |
| `contact_role` | Events & private bookings |
| `contact_email` | events@example.com |
| `contact_phone` | (512) 555-0100 |
| `contact_response_time` | We typically reply within a day. |
| `general_inquiry_email` | Staff inbox for general contact form (e.g. info@ alias) |
| `general_inquiry_from` | From address on general contact emails — `info@clarasdaydive.com` |
| `contact_us_eyebrow` | Get in touch — contact **section** eyebrow (above both cards) |
| `contact_us_title` | Contact us — contact **section** heading |
| `contact_us_lead` | Intro copy for the contact **section** |
| `general_contact_eyebrow` | General inquiry — **general card** label |
| `general_contact_title` | Send a message — **general card** heading (+ general modal title) |
| `general_contact_pitch` | Body copy on the general inquiry card |
| `general_contact_button` | Send message — general card + modal submit label |
| `general_contact_note` | Optional note under general card button (leave blank to hide; falls back to `contact_response_time` if set) |
| `event_contact_eyebrow` | Book the bar — **event card** label |
| `event_contact_title` | Plan your event — **event card** heading |
| `event_contact_pitch` | Body copy on the event card |
| `event_contact_button` | Request an event — event card button (+ event modal title context) |
| `event_contact_note` | Optional note under event card (e.g. For private events and patio bookings only.) |
| `events_inquiry_email` | Staff inbox for event booking form |
| `events_inquiry_from` | From address on event emails — `events@clarasdaydive.com` |
| `events_host_note` | Want to host something on our patio?… |
| `events_source` | `sheet` (default) — or `calendar` for calendar-only; avoid `both` |
| `google_calendar_id` | Optional — calendar-only sync or import-from-calendar |
| `ask_clara_eyebrow` | Ask Clara |
| `ask_clara_title` | Not sure what to order? |
| `ask_clara_placeholder` | what should I drink today? |
| `ask_clara_button` | Dive in |
| `ask_clara_fallback` | Clara says: come on in — we'll pour you something good. |
| `seo_site_url` | https://www.clarasdaydive.com |
| `seo_title` | Clara's Day Dive — East Austin Coupe Bar & Patio |
| `seo_description` | Dive in for a day drink… |
| `seo_og_image` | `/assets/scarf.jpg` — social share image path |
| `maps_url` | Google Maps link for directions |
| `google_business_url` | Optional — Google Business Profile URL for schema |
| `google_site_verification` | Optional — Search Console HTML tag `content` value (not the full meta tag) |
| `gallery_eyebrow` | On the patio — gallery section label (optional if no photos) |
| `gallery_title` | A day at Clara's — gallery section heading (optional if no photos) |

Both columns are required on every row. **Optional keys** (`instagram_url`, `facebook_url`, `tiktok_url`, `google_business_url`, `google_site_verification`, `gallery_eyebrow`, `gallery_title`) can be left with an empty `value` cell — the site hides those icons/links until you fill them in. Gallery section copy uses defaults when photos exist but these keys are blank.

---

## `Hours`

**Row 1 headers:**

```
day_group | display_label | opens | closes | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `day_group` | Yes | Comma-separated days (`Monday,Tuesday,Wednesday,Thursday`) or range (`Monday-Thursday`) |
| `display_label` | Yes | Shown in footer, e.g. `Mon–Thu · 3pm–12am` |
| `opens` | Yes | 24h `HH:MM` for schema (e.g. `15:00`) |
| `closes` | Yes | 24h `HH:MM` (e.g. `00:00` for midnight) |
| `sort_order` | No | Lower numbers appear first |
| `active` | No | `FALSE` to hide row (default: active) |

---

## `Drinks`

**Row 1 headers:**

```
name | category | price | description | badge | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `name` | Yes | Drink name |
| `category` | Yes | Filter category — see [Adding drink categories](#adding-drink-categories) |
| `price` | Yes | Numeric (e.g. `11` or `11.50`) — synced as `$11` |
| `description` | Yes | Short description |
| `badge` | No | e.g. `House`, `Seasonal`, `No ABV` |
| `sort_order` | No | Lower numbers appear first |
| `active` | No | `FALSE` to hide |

### Adding drink categories

Categories are **not** a separate tab or dropdown. To add one:

1. Open the **Drinks** tab.
2. Type a new value in the `category` column on any drink row (e.g. `Spritz`, `Zero proof`).
3. Run sync and deploy — filter chips update automatically to `All` + sorted unique categories.

No schema change, no extra configuration.

---

## `Events`

**Default: edit the Events tab.** One source for the site — sheet **or** calendar, not both. Staff guide: [sheets-events.md](../sheets-events.md).

**Row 1 headers:**

```
title | start_datetime | end_datetime | tag | time_label | description | ticket_url | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `title` | Yes | Event name |
| `start_datetime` | Yes | `YYYY-MM-DD HH:MM` in **America/Chicago** |
| `end_datetime` | Yes | Must be after `start_datetime` |
| `tag` | Yes | e.g. `Live music`, `Market` |
| `time_label` | No | Display string, e.g. `7–10pm · Free` |
| `description` | Yes | Event description |
| `ticket_url` | No | RSVP / ticket link — button shown when set |
| `sort_order` | No | Lower numbers appear first |
| `active` | No | `FALSE` to hide |

`month` and `day` on the site are derived from `start_datetime` at sync — do not add those columns.

---

## `WhatsHere`

**Row 1 headers:**

```
title | tag | body | icon | hours | website_url | order_url | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `title` | Yes | Business or feature name (e.g. Bird Bird Biscuit) |
| `tag` | Yes | Eyebrow label (e.g. `Food truck`, `Til noon`) |
| `body` | Yes | Short description |
| `icon` | Yes | One of: `food-truck`, `coffee`, `sun` (`truck` accepted, stored as `food-truck`) |
| `hours` | No | That business's hours (e.g. `Mon–Fri · 8am–2pm`) |
| `website_url` | No | Link to the business website — shows **Visit website →** |
| `order_url` | No | Online ordering link — shows **Order now** button |
| `sort_order` | No | Lower numbers appear first |
| `active` | No | `FALSE` to hide |

---

## `Photos` (optional)

Upload photos to a shared **Google Drive folder**, then paste each share link here. On publish, images are downloaded, optimized to WebP, and served from the site. If no active rows exist, the gallery section and nav link are hidden.

**Row 1 headers:**

```
sort_order | active | image_url | alt_text | caption
```

| Column | Required | Notes |
|--------|----------|-------|
| `sort_order` | Yes | Lower numbers appear first |
| `active` | Yes | `FALSE` to hide without deleting the row |
| `image_url` | Yes | Google Drive share URL or any public `https://` image URL |
| `alt_text` | Yes | Short description for screen readers (accessibility) |
| `caption` | No | Optional caption shown below the image |

**Staff workflow:**

1. Upload to the shared Drive folder (**Clara's Day Dive — Site Photos**).
2. Share → **Anyone with the link → Viewer**, copy link.
3. Add a row with `image_url`, `alt_text`, and `sort_order`.
4. Publish site.

**Replacing a photo:** set `active` to `FALSE` on the old row, then add a new row with the new Drive link. Do not leave the old row active — both will show in the gallery until the old row is hidden.

Section heading copy comes from `_Settings` keys `gallery_eyebrow` and `gallery_title` (defaults: "The vibe" / "Photos").

---

## `FAQ`

**Row 1 headers:**

```
question | answer | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `question` | Yes | FAQ question |
| `answer` | Yes | FAQ answer |
| `sort_order` | No | Lower numbers appear first |
| `active` | No | `FALSE` to hide |

---

## `AskClara`

**Row 1 headers:**

```
suggestion | response | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `suggestion` | Yes | Chip label on the Ask Clara section |
| `response` | Yes | Canned reply (chip tap or Bedrock fallback) |
| `sort_order` | No | Chip order |
| `active` | No | `FALSE` to hide |

Suggestion chips that match user input exactly use the canned `response` with **no** Bedrock API call.

---

## `Knowledge` (optional)

**Row 1 headers:**

```
topic | fact | keywords | sort_order | active
```

| Column | Required | Notes |
|--------|----------|-------|
| `topic` | Yes | Short label (`Restrooms`, `Parking`, …) |
| `fact` | Yes | Venue fact for Ask Clara — not shown on the public FAQ |
| `keywords` | No | Comma-separated extra match words for retrieval |
| `sort_order` | No | Lower numbers first |
| `active` | No | `FALSE` to hide |

**Example rows:**

| topic | fact | keywords |
|-------|------|----------|
| Restrooms | The restrooms are toward the back of the bar — head past the bar and up the steps to the deck. | restroom,bathroom,wc |
| Parking | The gravel lot next to Lucky Duck is shared — you're welcome to park there. | parking,park,lucky duck |

---

## Quick copy — header rows only

Paste into row 1 of each tab:

| Tab | Row 1 |
|-----|-------|
| `_Settings` | `key` \| `value` |
| `Hours` | `day_group` \| `display_label` \| `opens` \| `closes` \| `sort_order` \| `active` |
| `Drinks` | `name` \| `category` \| `price` \| `description` \| `badge` \| `sort_order` \| `active` |
| `Events` | `title` \| `start_datetime` \| `end_datetime` \| `tag` \| `time_label` \| `description` \| `ticket_url` \| `sort_order` \| `active` |
| `WhatsHere` | `title` \| `tag` \| `body` \| `icon` \| `hours` \| `website_url` \| `order_url` \| `sort_order` \| `active` |
| `Photos` | `sort_order` \| `active` \| `image_url` \| `alt_text` \| `caption` |
| `FAQ` | `question` \| `answer` \| `sort_order` \| `active` |
| `AskClara` | `suggestion` \| `response` \| `sort_order` \| `active` |
| `Knowledge` | `topic` \| `fact` \| `keywords` \| `sort_order` \| `active` |

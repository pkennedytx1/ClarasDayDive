# Content & admin strategy

Clara's Day Dive is built in phases. The mockup ships with **JSON content files** so the site works without a backend. When you're ready to manage events, menus, and hours without editing code, pick a path below.

## Phase 1 — Now (mockup)

| Content | File | Who updates |
|---------|------|-------------|
| Site copy, contact placeholders, nav | `src/content/site.json` | Developer or deploy hook |
| Drinks menu | `src/content/drinks.json` | Same |
| Events calendar | `src/content/events.json` | Same |
| What's Here tiles | `src/content/whats-here.json` | Same |

All sections read through `src/lib/content.ts`. Swap that module later; components stay unchanged.

**AI search** in the hero is mock-only (canned responses from `site.json`). A real version needs an API route — likely SST Lambda + your LLM provider.

---

## Phase 2 — Calendar & content options

### Option A: Google Calendar (events only)

**Best if:** staff already maintain a shared bar calendar.

- Public Google Calendar → iCal feed or Calendar API
- Build script or SST cron fetches events before deploy (or on a schedule)
- Site shows parsed events; no custom admin UI needed for calendar

**Trade-off:** Drinks menu and hours still need another source.

### Option B: Headless CMS (Sanity, Contentful, etc.)

**Best if:** you want a polished admin UI for non-developers.

- Events, drinks, hours, contact info editable in CMS
- Vite build fetches content at build time (`getStaticProps`-style)
- Optional webhook → rebuild on publish

**Trade-off:** Monthly cost, initial CMS schema setup.

### Option C: Spreadsheet / Airtable

**Best if:** lightweight ops — event coordinator already lives in spreadsheets.

- Rows = events or menu items
- Pre-build script pulls via API
- Simple for a small team

**Trade-off:** Less polished than a CMS; field validation is DIY.

### Option D: Custom SST admin

**Best if:** you want everything in-house on AWS.

- SST: `StaticSite` + `Api` + DynamoDB (or S3 JSON blobs)
- Small password-protected admin app for events/menu
- Public site reads same data at build or via edge cache

**Trade-off:** Most build effort; full control.

---

## Recommendation

1. **Ship Phase 1** — validate design and copy with stakeholders.
2. **Events first** — Google Calendar sync is the fastest win if they use one.
3. **Menu + hours** — Sanity or JSON until volume justifies CMS.
4. **AI search** — defer until core site is live; add SST Function when ready.

---

## Contact section (current)

No form backend. Guests reach out via `mailto:` / `tel:` using placeholders in `site.json`:

```json
"contact": {
  "coordinatorName": "Your event coordinator",
  "email": "events@example.com",
  "phone": "(512) 555-0100"
}
```

Replace when real details are confirmed.

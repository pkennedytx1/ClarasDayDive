# Task 2 Report: Build-time `.ics` generation and JSON-LD

**Status:** DONE

## Summary

Added `scripts/generate-calendar.mjs` to read `events.json` and `site.json`, generate RFC 5545 VCALENDAR output (VEVENT logic duplicated from `src/lib/ics.ts`), and write `public/calendar/claras-day-dive.ics`. Updated `package.json` build chain to run sync → calendar → SEO → tsc → vite. Added `startDate` and `endDate` to Event schema items in `src/lib/schema.ts`.

## Files changed

| File | Action |
|------|--------|
| `scripts/generate-calendar.mjs` | Created — standalone ICS builder, writes 3-event feed |
| `scripts/sync-from-sheets.mjs` | Created — dev fallback stub (exits 0 when `GOOGLE_SHEET_ID` unset) |
| `package.json` | Modified — build runs sync → generate-calendar → generate-seo |
| `src/lib/schema.ts` | Modified — `startDate` / `endDate` on Event JSON-LD items |
| `public/calendar/claras-day-dive.ics` | Generated at build (1055 bytes, 3 VEVENTs) |

## Test output

```
> claras-day-dive@0.1.0 build
> node scripts/sync-from-sheets.mjs && node scripts/generate-calendar.mjs && node scripts/generate-seo.mjs && tsc --noEmit && vite build

GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated public/calendar/claras-day-dive.ics (3 events)
Generated sitemap.xml, robots.txt, llms.txt
✓ built in 580ms
```

```
$ ls public/calendar/claras-day-dive.ics
-rw-r--r--  1055  public/calendar/claras-day-dive.ics

$ head -1 public/calendar/claras-day-dive.ics
BEGIN:VCALENDAR
```

Exit code: **0** (PASS)

## Concerns

- **ICS logic duplication:** `generate-calendar.mjs` mirrors `src/lib/ics.ts` per plan; changes to either must be kept in sync manually until a shared module is extracted.
- **Sync stub:** `sync-from-sheets.mjs` is a minimal Task 5 placeholder (skip when no env, fail if env set). Full sheet sync not implemented yet.
- **Calendar not in sitemap:** `claras-day-dive.ics` is not listed in `sitemap.xml`; may be intentional for a downloadable asset rather than a crawlable page.

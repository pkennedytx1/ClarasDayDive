# Tasks 5–6 Report: Google Sheets sync + knowledge generation

**Status:** DONE

## Summary

Implemented full Google Sheets sync in `scripts/sync-from-sheets.mjs` with dev fallback (no `GOOGLE_SHEET_ID` → log, generate `knowledge.json` from existing JSON, exit 0). When set, authenticates via `GOOGLE_SERVICE_ACCOUNT_JSON` (inline JSON or file path), reads all seven tabs, validates row-level errors (email, numeric price, event datetime order), writes `site.json`, `drinks.json`, `events.json`, `whats-here.json`, `faq.json`, and `knowledge.json` — leaving `legal.json` untouched. Created `scripts/generate-knowledge.mjs` (28 chunks from current content: drinks, FAQ, events, whats-here, hours, settings, Ask Clara). Added `sync:content` script, installed `googleapis`, and documented tab schemas in `docs/sheets-setup.md`.

## Test output

```
$ node scripts/sync-from-sheets.mjs
GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated src/content/knowledge.json (28 chunks)
(exit 0)

$ npm run build
GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated src/content/knowledge.json (28 chunks)
Generated public/calendar/claras-day-dive.ics (3 events)
Generated sitemap.xml, robots.txt, llms.txt
✓ built in 579ms
```

## Concerns

- **Live sheet sync untested** — no `GOOGLE_SHEET_ID` / service account in this environment; parsers and validation logic are implemented per spec but need a real workbook smoke test.
- **SEO extras preserved from repo** — `seo.longDescription`, `keywords`, `geo`, and `priceRange` are merged from existing `site.json` on sync, not editable via `_Settings` (by design to avoid sheet bloat).
- **WhatsHere `tone`** — not in the sheet schema; first card gets `cream`, rest `white` (matches current placeholder layout; component does not use tone today).
- **`day_group` parsing** — supports comma-separated days and `Monday-Thursday` ranges; exotic formats may need sheet-setup clarification for staff.

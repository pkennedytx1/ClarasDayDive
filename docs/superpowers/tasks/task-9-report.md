# Task 9 Report: Ask Clara chat UI

**Status:** DONE

## Summary

Upgraded `SearchBar.tsx` from single-answer mode to multi-turn chat with local canned responses, API fallback, loading/error states, and refused styling.

| Area | Implementation |
|------|----------------|
| Message state | `{ role: 'user' \| 'clara', text: string, refused?: boolean }[]` |
| Chip click | Exact match in `responses` → append user + Clara messages locally (no API) |
| Form submit | `POST ${VITE_ASK_CLARA_API_URL \|\| ''}/api/ask` with `{ message, history }` — last 4 turns mapped to `{ role: 'user' \| 'assistant', content }` |
| Loading | "Clara is thinking…" with spinner; input/chips disabled |
| Error / non-OK | Appends `fallback` from `site.search.fallback` |
| Refused | API `refused: true` → `.search-bar__answer--refused` on Clara message |
| AskClara | Passes `responses` and `fallback` props instead of `onSubmit` callback |
| CSS | `.search-bar__messages`, message variants, loading spinner, refused styling |

**Files changed**

| File | Change |
|------|--------|
| `src/components/SearchBar.tsx` | Multi-turn chat, API integration, loading/error/refused handling |
| `src/sections/AskClara.tsx` | Pass `responses` + `fallback` from site content |
| `src/styles/components.css` | Chat message list, spinner, refused styling |

**Verification**

```
$ npm run build
GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated src/content/knowledge.json (28 chunks)
Generated public/calendar/claras-day-dive.ics (3 events)
Generated sitemap.xml, robots.txt, llms.txt
Copied …/src/content/knowledge.json → …/packages/ask-clara/knowledge.json
✓ built in 646ms
(exit 0)
```

## Concerns

- **E2E not verified** — Plan step 6 (deployed site smoke test) deferred; no live API call tested in this environment.
- **Empty `VITE_ASK_CLARA_API_URL`** — Relative `/api/ask` works via Vite dev proxy; production requires SST-injected URL at build time (Task 8).
- **History role mapping** — UI uses `clara`; API expects `assistant`. Mapping is done at submit time; local canned turns are included in subsequent API history correctly.

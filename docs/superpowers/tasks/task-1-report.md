# Task 1 Report: Event data model and helpers

**Status:** DONE

## Summary

Implemented the `SiteEvent` interface, date/calendar helper functions, and RFC 5545 ICS builder per plan. Updated all three events in `events.json` with ISO datetimes (America/Chicago `-05:00`), renamed `time` → `timeLabel`, and added `ticketUrl` on the Low-ABV happy hour event.

## Files changed

| File | Action |
|------|--------|
| `src/lib/events.ts` | Created — `SiteEvent`, `toDateKey`, `groupEventsByDate`, `formatDayHeading`, `buildGoogleCalendarUrl` |
| `src/lib/ics.ts` | Created — `buildIcsContent` with CRLF line endings and ICS escaping |
| `src/content/events.json` | Modified — added `start`/`end` ISO fields, `timeLabel`, optional `ticketUrl` |
| `src/lib/content.ts` | Modified — re-export `SiteEvent` type |
| `src/sections/Events.tsx` | Modified — `e.time` → `e.timeLabel` (required for build after schema rename) |
| `scripts/generate-seo.mjs` | Modified — `e.time` → `e.timeLabel` (required for build script) |

## Test output

```
> claras-day-dive@0.1.0 build
> node scripts/generate-seo.mjs && tsc --noEmit && vite build

Generated sitemap.xml, robots.txt, llms.txt
vite v6.4.3 building for production...
transforming...
✓ 68 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   2.32 kB │ gzip:  0.87 kB
dist/assets/index-BLJBCXK-.css   27.08 kB │ gzip:  5.68 kB
dist/assets/index-BGkMEKdp.js    78.48 kB │ gzip: 26.73 kB
dist/assets/vendor-BdZgHC1P.js  141.61 kB │ gzip: 45.44 kB
✓ built in 588ms
```

Exit code: **0** (PASS)

## Notes

- `events.ts` and `ics.ts` are not yet imported by app components; Task 2 will wire ICS generation into the build chain.
- Two out-of-scope files were updated minimally so `npm run build` passes after the `time` → `timeLabel` rename.

# Task 3 Report: Event actions component (list view)

**Status:** DONE

## Summary

Created `EventActions.tsx` with per-event calendar actions (Download `.ics` blob + Google Calendar link) and conditional ticket/RSVP link. Wired into `Events.tsx` below each event description, with section footer links for calendar subscription and a "View all events" button that sets `explorerOpen` state (Calendar Explorer deferred to Task 4). Added `.event-actions` and footer CSS matching existing pill button patterns.

## Files changed

| File | Action |
|------|--------|
| `src/components/EventActions.tsx` | Created — calendar download, Google Calendar, ticket link |
| `src/sections/Events.tsx` | Modified — EventActions per row, footer links, `explorerOpen` state |
| `src/styles/components.css` | Modified — `.event-actions`, `.events-footer`, `.events-view-all` |

## Test output

```
> claras-day-dive@0.1.0 build
> node scripts/sync-from-sheets.mjs && node scripts/generate-calendar.mjs && node scripts/generate-seo.mjs && tsc --noEmit && vite build

GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated public/calendar/claras-day-dive.ics (3 events)
Generated sitemap.xml, robots.txt, llms.txt
✓ built in 632ms
```

Exit code: **0** (PASS)

## Concerns

- **Calendar Explorer not wired:** `explorerOpen` state and button are in place; modal component comes in Task 4. Button sets state but nothing opens yet.
- **Single-event `.ics` download:** Uses client-side `buildIcsContent([event], …)` blob; feed subscription uses build-time `/calendar/claras-day-dive.ics` — two paths by design.
- **Ticket button visibility:** Only the third event (`Low-ABV happy hour`) has `ticketUrl` in current JSON; other rows show calendar actions only.

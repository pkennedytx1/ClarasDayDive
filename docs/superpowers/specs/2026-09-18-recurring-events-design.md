# Recurring Events & Sheet Formatting — Design Spec

**Date:** 2026-09-18  
**Status:** Approved  
**Goal:** Let Clara's staff maintain weekly recurring events from one sheet row, and make column formatting obvious without a separate training doc.

---

## 1. Problem

The Events tab only supports **one-off** rows (`start_datetime` + `end_datetime`). The client has recurring programming (e.g. live music every Friday) and does not want to duplicate rows every week.

Staff also need **in-sheet guidance** on how to format datetimes, tags, and optional fields — ideally visible while editing, without relying on external docs alone.

---

## 2. Decision Summary

| Choice | Decision |
|--------|----------|
| Recurrence model | **Approach A** — optional columns on the same Events row |
| v1 recurrence types | **`weekly` only** (same weekday/time as `start_datetime`) |
| Expansion | At **sync/publish** — each occurrence becomes a normal `SiteEvent` |
| Future | `biweekly`, `monthly` can be added later without schema change |
| Sheet help | **Example row (row 2)** + **header cell notes** (native Sheets hover) |
| “?” icon | **Not available natively** — use ℹ️ in header text + corner note triangle |

---

## 3. Events Tab Schema (v1)

### New columns (after `active`, or before — TBD at implementation; append is safest for existing sheets)

```
recurrence | recurrence_until
```

| Column | Required | Notes |
|--------|----------|-------|
| `recurrence` | No | Empty = one-off. v1 allowed value: `weekly` |
| `recurrence_until` | When `recurrence` set | Last calendar date the series may occur, `YYYY-MM-DD` (America/Chicago) |

All existing columns unchanged:

```
title | start_datetime | end_datetime | tag | time_label | description | ticket_url | sort_order | active | recurrence | recurrence_until
```

### Staff rules

1. **One-off event** — leave `recurrence` and `recurrence_until` blank.
2. **Weekly series** — fill first occurrence in `start_datetime` / `end_datetime`, set `recurrence` = `weekly`, set `recurrence_until` = last day the series runs.
3. **`start_datetime` defines the weekday** — e.g. `2026-09-19 19:00` (a Friday) → every Friday at 7pm until `recurrence_until`.
4. **`time_label` is display copy** — staff can write `Every Friday · 7–10pm · Free` for clarity on the site; sync does not auto-generate this in v1.
5. **`active` = FALSE** hides the entire series (all generated occurrences).

### Example rows

| title | start_datetime | end_datetime | tag | time_label | recurrence | recurrence_until |
|-------|----------------|--------------|-----|------------|------------|------------------|
| Patio vinyl night | 2026-09-19 19:00 | 2026-09-19 22:00 | Live music | Every Friday · 7–10pm · Free | weekly | 2026-12-31 |
| Makers market | 2026-09-20 12:00 | 2026-09-20 17:00 | Market | 12–5pm · Free | *(empty)* | *(empty)* |

---

## 4. Sync Behavior

### Expansion algorithm (`expandRecurringEvents`)

For each active row where `recurrence === 'weekly'`:

1. Parse `start_datetime` / `end_datetime` → first occurrence start/end (Chicago).
2. Parse `recurrence_until` as end-of-day Chicago on that date.
3. Walk forward in **7-day steps** from the first start while `occurrence_start <= recurrence_until`.
4. Cap expansion at **26 weeks** (~6 months) from first occurrence to bound JSON size.
5. Each step produces one `SiteEvent` with the same title, tag, desc, ticketUrl, timeLabel as the source row; only `start`, `end`, `month`, `day` differ.
6. Assign a shared `seriesId` (hash of row identity or deterministic slug) on each expanded item — **optional v1**, useful for calendar dedup later; can omit if YAGNI.

For rows with empty `recurrence`, behavior is unchanged (single item).

### Validation errors (sync fails with clear message)

| Condition | Error |
|-----------|-------|
| `recurrence` set but not `weekly` (v1) | `Events row N: recurrence must be empty or "weekly"` |
| `recurrence` = `weekly` but `recurrence_until` empty | `Events row N: recurrence_until required when recurrence is weekly` |
| `recurrence_until` before first `start_datetime` date | `Events row N: recurrence_until must be on or after start date` |
| Invalid date formats | Existing datetime validation |

### Post-expansion

- Apply existing `filterUpcomingEvents` (production) — past occurrences drop off automatically.
- Dev mode (`import.meta.env.DEV`) continues to show all occurrences for QA.
- Sort all items by `start` ascending.

### Files to change

| File | Change |
|------|--------|
| `scripts/sync-from-sheets.mjs` | Parse new columns; call expand before write |
| `scripts/lib/expand-recurring-events.mjs` | **New** — pure expansion logic + tests |
| `docs/sheets-template/csv/Events.csv` | Add columns + one weekly example row |
| `docs/sheets-events.md` | Staff guide for weekly recurrence |
| `docs/sheets-template/README.md` | Column docs |
| `docs/sheets-template/csv/README.md` | Example row note |

No frontend component changes required — expanded items are normal events in `events.json`.

---

## 5. Google Sheets Formatting & Examples

Google Sheets has **no native “?” hover tooltip**. Recommended pattern:

### Row 1 — Headers with notes

- Header text may include ℹ️ where helpful: `start_datetime ℹ️`
- **Insert → Note** on each header cell with format rules (shows on hover via corner triangle)

Example notes:

| Header | Note text |
|--------|-----------|
| `start_datetime` | First date & start time. Format: `YYYY-MM-DD HH:MM` in Central Time. Example: `2026-09-19 19:00` |
| `end_datetime` | End time on that same day. Must be after start. Example: `2026-09-19 22:00` |
| `recurrence` | Leave blank for one-time events. For weekly series, type: `weekly` |
| `recurrence_until` | Last date the weekly series runs. Format: `YYYY-MM-DD`. Example: `2026-12-31` |
| `time_label` | What guests see (any text). Example: `Every Friday · 7–10pm · Free` |
| `active` | `TRUE` to show, `FALSE` to hide without deleting |

### Row 2 — Live examples (never published)

- Gray background, italic text (manual or via Apps Script setup)
- Every example row has `active` = `FALSE`
- Sync already skips inactive rows — **no code change needed** for example row filtering
- Shows one one-off + one weekly example side by side

### Optional: Apps Script helper

Add `setupEventsTabFormatting()` in `docs/sheets-publish/` (or extend existing publish script docs):

- Applies header notes from a constant map
- Styles row 2 as example
- Freezes row 1
- Can be run once from **Clara's Day Dive → Format Events tab**

Not required for v1 if CSV import + manual notes suffice; document the manual steps in `sheets-events.md`.

---

## 6. Deliverables

### IS

- `weekly` recurrence + `recurrence_until` column support in sync
- Expansion into individual site events (≤26 weeks cap)
- Updated CSV template with example weekly row
- Updated staff docs (`sheets-events.md`, template README)
- Unit tests for expansion edge cases (DST boundary, until date mid-week, inactive series)

### IS NOT

- `biweekly` / `monthly` / “first Saturday” rules (future)
- Auto-generated `time_label` text
- Google Calendar recurrence import
- UI badge like “Recurring” on event cards (future polish)
- Automatic Apps Script formatting (optional follow-up)

---

## 7. Testing

| Case | Expected |
|------|----------|
| One-off row (no recurrence) | Single event, unchanged |
| Weekly row, until 8 weeks out | 8 occurrences (or 9 if inclusive of start — define inclusive in impl) |
| Weekly row, until in past | Zero upcoming after filter (prod) |
| `active=FALSE` weekly row | Zero occurrences |
| `recurrence=weekly`, missing until | Sync error |
| `recurrence=biweekly` | Sync error in v1 |
| Dev + `npm run sync:events` | All expanded rows visible including past |
| Calendar explorer | Multiple dates highlighted for weekly series |

---

## 8. Future Extensions

When client needs more:

| Feature | Add |
|---------|-----|
| Every other week | `recurrence` = `biweekly` |
| First Saturday of month | `recurrence` = `monthly:first-saturday` or separate column |
| Series label on card | Optional `recurrence_label` or auto-derive from weekday |
| Sheet “?” help | Apps Script sidebar with column guide |

---

## Resources

- Current events guide: [sheets-events.md](../../sheets-events.md)
- Sync: [scripts/sync-from-sheets.mjs](../../../scripts/sync-from-sheets.mjs)
- Local dev events: `npm run sync:events` / `npm run dev`

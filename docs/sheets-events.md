# Events — staff guide

How events get onto the Clara's Day Dive website.

---

## Recommended: sheet only

**Default for Clara's Day Dive.** Staff maintain the **Events** tab in the workbook. No Google Calendar setup required.

| Step | Who | Action |
|------|-----|--------|
| 1 | Staff | Add or edit rows on the **Events** tab |
| 2 | Staff | **Clara's Day Dive → Publish site** (checks Events tab first; blocks publish if errors) |
| 3 | Guests | See events on the site, Calendar Explorer, and per-event “Add to calendar” |

In `_Settings`, either omit calendar keys or set explicitly:

| key | value |
|-----|-------|
| `events_source` | `sheet` |

Do **not** set `google_calendar_id` unless you switch to calendar-only (below).

### Events tab columns

```
title | start_datetime | end_datetime | tag | time_label | description | ticket_url | active | recurrence | recurrence_until | featured
```

- **Datetimes:** `YYYY-MM-DD HH:MM` in **America/Chicago** (e.g. `2026-09-19 19:00`)
- **`month` / `day` on the site** are calculated at publish — do not add those columns
- **`time_label`** display text only — e.g. `Every Friday · 7–10pm · Free`
- **`ticket_url`** optional — shows “Get tickets / RSVP →” when set
- **`active`:** `FALSE` to hide an event without deleting the row
- **`recurrence`** optional — leave blank for one-time events; set to `weekly` for a repeating series
- **`recurrence_until`** required when `recurrence` = `weekly` — last date the series runs (`YYYY-MM-DD`)
- **`featured`** optional — `TRUE` on **one row only** to highlight the next upcoming occurrence on the homepage; leave blank/`FALSE` otherwise
- Events appear on the site in **date order** — no manual sort column needed

#### Weekly recurring events

1. Put the **first occurrence** in `start_datetime` and `end_datetime` (weekday + times).
2. Set `recurrence` = `weekly`.
3. Set `recurrence_until` = last calendar date the series should run (e.g. `2026-12-31`).
4. Publish expands one row into individual dates on the site (up to ~6 months ahead).

**Example:** Live music every Friday until end of year:

| title | start_datetime | end_datetime | recurrence | recurrence_until | time_label |
|-------|----------------|--------------|------------|------------------|------------|
| Patio vinyl night | 2026-09-19 19:00 | 2026-09-19 22:00 | weekly | 2026-12-31 | Every Friday · 7–10pm · Free |

### Formatting help in the sheet

Google Sheets does not support Excel-style `?` hover tooltips. Use these instead:

1. **Row 2 examples** — gray italic sample rows with `active` = `FALSE` (never published; see CSV template).
2. **Notes on header cells** — hover the small triangle in the corner of each column header for format rules.
3. **Format Events tab** (one time) — in the workbook menu: **Clara's Day Dive → Format Events tab**. Applies header notes and example-row styling automatically ([SetupEventsTab.gs](./sheets-publish/SetupEventsTab.gs)).

### Staff quick reference

| I want to… | Do this |
|------------|---------|
| Add a one-time event | Fill start/end datetimes; leave `recurrence` blank |
| Add weekly programming | First occurrence + `recurrence` = `weekly` + `recurrence_until` |
| Highlight a big event | `featured` = `TRUE` on **one row** (next upcoming occurrence shows on homepage) |
| Hide an event | `active` = `FALSE` |
| Change display order | Not needed — site sorts by date automatically |

Suggested header notes:

| Column | Note |
|--------|------|
| `start_datetime` | First date & start time. `YYYY-MM-DD HH:MM` Central. Example: `2026-09-19 19:00` |
| `end_datetime` | End time same day. Must be after start. Example: `2026-09-19 22:00` |
| `recurrence` | Blank = one-time. For weekly series type: `weekly` |
| `recurrence_until` | Last date series runs. `YYYY-MM-DD`. Example: `2026-12-31` |
| `time_label` | What guests see. Example: `Every Friday · 7–10pm · Free` |
| `active` | `TRUE` to show, `FALSE` to hide |

---

## One source only — sheet **or** calendar

The site reads events from **one place per publish**, not two merged lists.

| `events_source` | Where events come from | Events tab used? |
|-----------------|------------------------|------------------|
| `sheet` (default) | **Events** tab | Yes — edit here |
| `calendar` | Google Calendar API at publish time | No — tab ignored |
| `both` | Sheet + calendar combined | Not recommended — duplicates |

**Pick one workflow:**

1. **Sheet only** (recommended) — edit Events tab, publish.
2. **Calendar only** — staff edit Google Calendar; publish pulls into the site. Sheet Events tab is not used.

Avoid `both` unless you keep completely separate events in each place.

---

## Optional: Google Calendar only (no sheet editing)

Use this only if the team **already** runs a shared bar calendar and does not want to type events into the sheet.

### Setup (developer, one time)

1. Enable **Google Calendar API** in the GCP project (see [sheets-setup.md](./sheets-setup.md)).
2. Share the calendar with the service account email (**See all event details**).
3. In `_Settings`:

| key | value |
|-----|-------|
| `google_calendar_id` | Calendar ID from Google Calendar settings |
| `events_source` | `calendar` |

4. Optional: `GOOGLE_CALENDAR_ID` in GitHub Actions secrets (overrides the sheet setting).

### Extra fields in Google Calendar descriptions

Put these lines at the **top** of the event description:

```
TAG: Live music
TIME: 7–10pm · Free
TICKETS: https://partiful.com/your-event

Soul & disco on the turntable…
```

| Line | Site field |
|------|------------|
| `TAG:` | Event badge |
| `TIME:` / `TIME_LABEL:` | Display time |
| `TICKETS:` / `RSVP:` | Ticket button URL |

---

## Pull Google Calendar → Events sheet (optional)

**Not automatic.** Google does not sync calendar rows into a spreadsheet by itself.

If staff draft events in Google Calendar but you want the **sheet to stay the source of truth** for the website:

1. Keep `events_source` = `sheet` (default).
2. When ready, run **Clara's Day Dive → Import events from calendar** (optional Apps Script — see below).
3. Review imported rows on the **Events** tab (edit copy, tickets, tags).
4. **Publish site**.

Import **replaces** all rows on the Events tab (below the header). Always review before publishing.

### Install the import button (developer, one time)

1. In the workbook: **Extensions → Apps Script**.
2. Add a second file and paste [`ImportCalendarEvents.gs`](./sheets-publish/ImportCalendarEvents.gs).
3. Ensure `PublishSite.gs` menu includes **Import events from calendar** (included in repo).
4. Reload the spreadsheet.

Requires `google_calendar_id` in `_Settings` (or Script property `GOOGLE_CALENDAR_ID`). The script runs as **you** (the logged-in editor), so the calendar must be visible to your Google account — no service account share needed for import.

---

## What guests see (any source)

After publish, all of these use the same event list:

- **Upcoming events** on the homepage
- **View all events →** (Calendar Explorer)
- Per event: **Download .ics**, **Google Calendar**, **Get tickets** (if URL set)

There is no “subscribe to all events” feed — guests add individual events they care about.

---

## Quick reference

| Question | Answer |
|----------|--------|
| Where do we add events? | **Events** tab (default) |
| Do we need Google Calendar? | **No** for launch |
| Sheet and calendar together? | **No** — pick one source; use import if you draft in GCal |
| When does the site update? | After **Publish site** |
| Do guest calendars auto-update? | Per-event adds are one-time; no live “follow all” feed |

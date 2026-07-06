# Events — staff guide

How events get onto the Clara's Day Dive website.

---

## Recommended: sheet only

**Default for Clara's Day Dive.** Staff maintain the **Events** tab in the workbook. No Google Calendar setup required.

| Step | Who | Action |
|------|-----|--------|
| 1 | Staff | Add or edit rows on the **Events** tab |
| 2 | Staff | **Clara's Day Dive → Publish site** |
| 3 | Guests | See events on the site, Calendar Explorer, and per-event “Add to calendar” |

In `_Settings`, either omit calendar keys or set explicitly:

| key | value |
|-----|-------|
| `events_source` | `sheet` |

Do **not** set `google_calendar_id` unless you switch to calendar-only (below).

### Events tab columns

```
title | start_datetime | end_datetime | tag | time_label | description | ticket_url | sort_order | active
```

- **Datetimes:** `YYYY-MM-DD HH:MM` in **America/Chicago** (e.g. `2026-07-18 19:00`)
- **`month` / `day` on the site** are calculated at publish — do not add those columns
- **`ticket_url`** optional — shows “Get tickets / RSVP →” when set
- **`active`:** `FALSE` to hide an event without deleting the row

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

# CSV templates for Google Sheets

Import one CSV per tab in **Clara's Day Dive — Site Content**.

## Steps

1. Create a new Google Sheet.
2. Rename the first tab to `_Settings` (exact name, including underscore).
3. **File → Import → Upload** → choose `_Settings.csv` → **Replace current sheet**.
4. Add 8 more tabs named exactly: `Hours`, `Drinks`, `Events`, `WhatsHere`, `Photos`, `FAQ`, `AskClara`, `Knowledge` (`Photos` and `Knowledge` are optional).
5. For each tab: **File → Import → Upload** the matching CSV → **Replace current sheet**.
6. Share the sheet with your service account email (see [sheets-setup.md](../../sheets-setup.md)).
7. Set `GOOGLE_SHEET_ID` and run `npm run sync:content`.

## Local dev (Events + gallery)

**Events:** `npm run dev` syncs from `Events.csv` in this folder automatically (`LOCAL_EVENTS=1`). To re-sync without restarting the dev server:

```bash
npm run sync:events
```

Only **upcoming** events appear on the site (past dates are filtered at sync and on the homepage). Replace placeholder rows with real client content before publishing.

**Production sheet:** Import this CSV into the live **Events** tab, then run **Clara's Day Dive → Format Events tab** in Google Sheets. See [CHECKLIST.md](../../sheets-publish/CHECKLIST.md) step C8.

**Gallery:** For layout QA without the Google Sheet:

```bash
npm run sync:gallery
npm run dev
```

Then open **http://localhost:5173/gallery**.

This uses `Photos.csv` only when you run `sync:gallery` (sets `LOCAL_PHOTOS=1`). It does **not** run on deploy or normal `sync:content` — production always reads the Sheet `Photos` tab.

## Files

| CSV file | Tab name |
|----------|----------|
| `_Settings.csv` | `_Settings` |
| `Hours.csv` | `Hours` |
| `Drinks.csv` | `Drinks` |
| `Events.csv` | `Events` |
| `WhatsHere.csv` | `WhatsHere` |
| `Photos.csv` | `Photos` |
| `FAQ.csv` | `FAQ` |
| `AskClara.csv` | `AskClara` |
| `Knowledge.csv` | `Knowledge` |

All data is placeholder — replace with client content before launch.

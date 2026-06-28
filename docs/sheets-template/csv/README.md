# CSV templates for Google Sheets

Import one CSV per tab in **Clara's Day Dive — Site Content**.

## Steps

1. Create a new Google Sheet.
2. Rename the first tab to `_Settings` (exact name, including underscore).
3. **File → Import → Upload** → choose `_Settings.csv` → **Replace current sheet**.
4. Add 7 more tabs named exactly: `Hours`, `Drinks`, `Events`, `WhatsHere`, `FAQ`, `AskClara`, `Knowledge` (Knowledge is optional for older workbooks).
5. For each tab: **File → Import → Upload** the matching CSV → **Replace current sheet**.
6. Share the sheet with your service account email (see [sheets-setup.md](../../sheets-setup.md)).
7. Set `GOOGLE_SHEET_ID` and run `npm run sync:content`.

## Files

| CSV file | Tab name |
|----------|----------|
| `_Settings.csv` | `_Settings` |
| `Hours.csv` | `Hours` |
| `Drinks.csv` | `Drinks` |
| `Events.csv` | `Events` |
| `WhatsHere.csv` | `WhatsHere` |
| `FAQ.csv` | `FAQ` |
| `AskClara.csv` | `AskClara` |
| `Knowledge.csv` | `Knowledge` |

All data is placeholder — replace with client content before launch.

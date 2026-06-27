# Task 10 Report: Sheets template and staff docs

**Status:** DONE

## Summary

Expanded staff-facing documentation for the Google Sheets content model and publish workflow. No Google Sheet was created — documentation only.

| Deliverable | Contents |
|-------------|----------|
| `docs/sheets-setup.md` | Expanded setup guide: GCP service account steps (API enable, key, share sheet), env vars `GOOGLE_SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON`, manual publish (`npm run sync:content && npm run deploy`), AWS Bedrock Nova Lite enablement, Ask Clara $5/month budget note, drink category workflow |
| `docs/sheets-template/README.md` | Per-tab row 1 column headers matching spec §3, field notes, quick-copy header table, drink categories section |

All seven tabs documented: `_Settings`, `Hours`, `Drinks`, `Events`, `WhatsHere`, `FAQ`, `AskClara`. Headers align with `scripts/sync-from-sheets.mjs` and `docs/superpowers/specs/2026-06-25-claras-demo-design.md` §3.

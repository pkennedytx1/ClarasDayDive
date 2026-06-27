# Publish setup checklist

Use this list in order. Hybrid calendar (`events_source: both`) can wait until publish is live.

---

## Phase A — GitHub (developer, ~15 min)

- [ ] **A1.** Create an empty repo on GitHub (e.g. `your-org/claras-day-dive`). Do not add a README if you are pushing an existing folder.

- [ ] **A2.** Push this project:

```bash
cd /Users/pkennedytx1/Desktop/Simplifi/ClarasDayDive
git add .
git commit -m "Add Clara's Day Dive site and publish workflow"
git remote add origin git@github.com:YOUR_ORG/claras-day-dive.git
git push -u origin main
```

Replace `YOUR_ORG/claras-day-dive` with your repo.

- [ ] **A3.** Confirm **Actions → Publish site** appears in GitHub.

---

## Phase B — GitHub Secrets (developer)

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Where to get it |
|--------|-----------------|
| `GOOGLE_SHEET_ID` | Sheet URL ID: `1ywKxum0DWOoP64laC6yWJ4wNQEEwVjYJA97cOuGj5u0` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON from `claras-sync-key.json` (one line is fine) |
| `AWS_ACCESS_KEY_ID` | IAM user used for local `npm run deploy` |
| `AWS_SECRET_ACCESS_KEY` | Same IAM user |

Optional later: `GOOGLE_CALENDAR_ID` (skip for now if events are sheet-only).

- [ ] **B1.** All four required secrets saved.

- [ ] **B2.** Test deploy from GitHub: **Actions → Publish site → Run workflow → Run workflow**.

- [ ] **B3.** First run is green (sync + deploy). Fix any errors before Phase C.

Common failures:
- Sync: sheet not shared with `claras-sheet-sync@taproot-491718.iam.gserviceaccount.com`
- Deploy: AWS keys wrong or Bedrock Nova Lite not enabled in `us-east-1`

---

## Phase C — Apps Script in the Sheet (developer, ~10 min)

- [ ] **C1.** Create GitHub PAT: **Settings → Developer settings → Fine-grained token**
  - Repo: your `claras-day-dive` repo only
  - **Actions:** Read and write
  - **Contents:** Read-only

- [ ] **C2.** Open the content workbook in Google Sheets.

- [ ] **C3.** **Extensions → Apps Script** → replace `Code.gs` with [`PublishSite.gs`](./PublishSite.gs) from this repo.

- [ ] **C4.** **Project settings → Script properties:**

| Property | Example |
|----------|---------|
| `GITHUB_TOKEN` | `github_pat_…` |
| `GITHUB_REPO` | `your-org/claras-day-dive` |

- [ ] **C5.** Save script, reload spreadsheet → menu **Clara's Day Dive → Publish site** shows.

- [ ] **C6.** Click **Publish site** → confirm → GitHub Actions run starts (204 = success).

- [ ] **C7.** Optional: **Insert → Drawing** “Publish site” → assign script `publishSite`.

---

## Phase D — Staff handoff

Tell staff:

1. Edit the sheet as usual.
2. **Clara's Day Dive → Publish site** when ready to go live.
3. Wait ~5 minutes; refresh the site.

Track runs: `https://github.com/YOUR_ORG/claras-day-dive/actions`

---

## Quick local test (before GitHub)

Confirms secrets will work in Actions:

```bash
export GOOGLE_SHEET_ID="1ywKxum0DWOoP64laC6yWJ4wNQEEwVjYJA97cOuGj5u0"
export GOOGLE_SERVICE_ACCOUNT_JSON="/path/to/claras-sync-key.json"
npm run sync:content
npm run deploy
```

If both succeed locally, GitHub only needs the same values as secrets.

---

## After publish works

- [ ] Set `seo_site_url` in `_Settings` to the live SST URL, publish once more.
- [ ] Later: `google_calendar_id` + `events_source: both` for hybrid events.

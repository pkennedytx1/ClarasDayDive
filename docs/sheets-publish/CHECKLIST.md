# Publish setup checklist

Use this list in order. Events use the **Events sheet tab** by default — see [sheets-events.md](../sheets-events.md).

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
| `AWS_ACCESS_KEY_ID` | IAM access key — **Secret** (recommended) or **Variable** |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key — must be a **Secret** |

Optional later: `GOOGLE_CALENDAR_ID` — only if using calendar-only sync (most teams skip this).

Optional for custom domain: `ACM_CERT_ARN` — **Secret** with the us-east-1 certificate ARN. See [godaddy-domain-setup.md](../godaddy-domain-setup.md).

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

- [ ] **C3.** **Extensions → Apps Script** → paste [`PublishSite.gs`](./PublishSite.gs); optional [`ImportCalendarEvents.gs`](./ImportCalendarEvents.gs).

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

1. Edit the sheet as usual (**Events** tab for upcoming events).
2. **Clara's Day Dive → Publish site** when ready to go live.
3. Wait ~5 minutes; refresh the site.

Events guide: [sheets-events.md](../sheets-events.md)

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

Production deploy (with custom domain):

```bash
export SST_STAGE=production
export ACM_CERT_ARN="arn:aws:acm:us-east-1:622885995693:certificate/6af1e80c-9969-4d51-b994-3cc9e8c3cd40"
npm run deploy
```

---

## After publish works

- [ ] Custom domain live — [godaddy-domain-setup.md](../godaddy-domain-setup.md) (GoDaddy DNS + ACM)
- [ ] Set `seo_site_url` in `_Settings` to `https://www.clarasdaydive.com` (or apex if forwarding is configured), publish once more.
- [ ] Add `events_source` = `sheet` in `_Settings` if not already set.
- [ ] Optional later: Google Calendar import or calendar-only — [sheets-events.md](../sheets-events.md).

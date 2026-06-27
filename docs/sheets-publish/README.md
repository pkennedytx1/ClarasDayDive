# Publish site from Google Sheets

Staff click **Publish site** in the workbook to sync content and deploy the live site via GitHub Actions + SST.

**Short checklist:** [CHECKLIST.md](./CHECKLIST.md) — use this to get publish working step by step.

**Flow:** Sheet → Apps Script → GitHub `repository_dispatch` → `.github/workflows/publish.yml` → `sync:content` → `deploy`

---

## 1. Push the repo to GitHub

The project must live in a GitHub repository before the button can work.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR_ORG/claras-day-dive.git
git push -u origin main
```

Use your actual org/repo name everywhere below.

---

## 2. GitHub repository secrets

In **GitHub → Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret | Required | Purpose |
|--------|----------|---------|
| `GOOGLE_SHEET_ID` | Yes | Workbook ID (or full Sheets URL) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Yes | Full service account key JSON (same as local sync) |
| `AWS_ACCESS_KEY_ID` | Yes | IAM user for `sst deploy` |
| `AWS_SECRET_ACCESS_KEY` | Yes | IAM secret for deploy |
| `GOOGLE_CALENDAR_ID` | No | Only if events come from Google Calendar |

**Optional variable** (Settings → Variables → Actions):

| Variable | Default | Purpose |
|----------|---------|---------|
| `AWS_REGION` | `us-east-1` | Deploy region (Bedrock + SST) |

The IAM user needs permissions for SST to create/update the static site, API Gateway, Lambda, and DynamoDB in your account.

---

## 3. Verify the workflow

1. Open **Actions** in GitHub.
2. Select **Publish site**.
3. Click **Run workflow** (manual test).
4. Confirm the run completes: sync → deploy.

Fix any secret or AWS permission errors before wiring the sheet button.

---

## 4. Create a GitHub token for Apps Script

Apps Script needs a token that can trigger workflows on your repo.

### Fine-grained PAT (recommended)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. **Generate new token**.
3. Repository access: **Only select repositories** → your `claras-day-dive` repo.
4. Permissions:
   - **Actions:** Read and write
   - **Contents:** Read-only
   - **Metadata:** Read-only
5. Copy the token — you will paste it once into Apps Script properties.

### Classic PAT (alternative)

Classic token with **`repo`** scope (private repos) or **`public_repo`** (public repos).

Store the token securely. Do **not** put it in the Sheet or commit it to git.

---

## 5. Install Apps Script in the workbook

1. Open **Clara's Day Dive — Site Content** in Google Sheets.
2. **Extensions → Apps Script**.
3. Delete any placeholder code in `Code.gs`.
4. Copy the contents of [`PublishSite.gs`](./PublishSite.gs) from this repo into `Code.gs`.
5. **Project settings** (gear icon) → **Script properties** → Add:

   | Property | Value |
   |----------|-------|
   | `GITHUB_TOKEN` | PAT from step 4 |
   | `GITHUB_REPO` | `owner/repo` (e.g. `simplifi/claras-day-dive`) |

6. **Save** the project (Ctrl/Cmd+S).
7. Reload the spreadsheet — menu **Clara's Day Dive → Publish site** should appear.

### First run — authorize the script

The first time someone clicks **Publish site**, Google asks them to authorize the script (external request to GitHub). Only editors who need to publish should approve this.

---

## 6. Optional: toolbar button

Instead of (or in addition to) the menu:

1. **Insert → Drawing** → add text **Publish site** → **Save and close**.
2. Click the drawing → **⋮** → **Assign script** → type `publishSite` → **OK**.

---

## 7. Staff workflow

1. Edit content in the sheet (any tab).
2. **Clara's Day Dive → Publish site** (or click the drawing).
3. Confirm the dialog.
4. Wait ~5 minutes; check the live site.

The GitHub Actions tab shows progress:  
`https://github.com/YOUR_ORG/claras-day-dive/actions`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Menu missing after reload | Re-open the sheet; confirm Apps Script saved and `onOpen` exists |
| `Publish not configured` | Set `GITHUB_TOKEN` and `GITHUB_REPO` in Script properties |
| GitHub 404 | Wrong `GITHUB_REPO`, or token lacks access to that repo |
| GitHub 403 | Token missing **Actions: Read and write** |
| Workflow not listed | Push `.github/workflows/publish.yml` to the default branch |
| Sync fails in Action | Check `GOOGLE_SHEET_ID` and service account JSON; sheet shared with service account |
| Deploy fails in Action | Check AWS secrets and IAM permissions; Bedrock model access enabled |
| Sheet validates but site unchanged | Confirm Action finished green; hard-refresh browser |

---

## Security notes

- Keep the GitHub PAT in **Script properties**, not in sheet cells.
- Service account JSON lives in **GitHub Secrets**, not in the repo.
- Rotate the PAT if it is ever exposed.
- Limit sheet **Editor** access to staff who should be able to publish.

---

## Related docs

- [sheets-setup.md](../sheets-setup.md) — service account, tabs, manual publish
- [superpowers/specs/2026-06-25-claras-demo-design.md](../superpowers/specs/2026-06-25-claras-demo-design.md) — full platform spec

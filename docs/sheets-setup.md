# Google Sheets Setup — Clara's Day Dive

Staff edit site content in a Google Sheet. The build syncs that sheet into `src/content/*.json` before the site is deployed.

**Workbook name:** `Clara's Day Dive — Site Content`

**Column reference:** [docs/sheets-template/README.md](./sheets-template/README.md) — full headers per tab matching the spec.

---

## 1. Create the workbook

1. Create a new Google Sheet named **Clara's Day Dive — Site Content**.
2. Add one tab per section below (**exact tab names — case-sensitive**):
   - `_Settings`
   - `Hours`
   - `Drinks`
   - `Events`
   - `WhatsHere`
   - `FAQ`
   - `AskClara`
   - `Knowledge` (optional — Ask Clara venue facts; see below)
3. Copy the column headers from [sheets-template/README.md](./sheets-template/README.md) into row 1 of each tab.
4. Fill in content starting at row 2.

> **Note:** `legal.json` is **not** synced from the sheet. Privacy policy and terms stay in the repo.

---

## 2. Google service account setup

The sync script reads the sheet with a **Google Cloud service account** (server-to-server — no staff Google login at build time).

### Step 1 — Create or select a GCP project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Use the project picker → **New Project** (e.g. `claras-day-dive`) or select an existing project.

### Step 2 — Enable Google APIs

1. Go to **APIs & Services → Library**.
2. Enable **Google Sheets API**.
3. Enable **Google Calendar API** (required if events come from Google Calendar).

### Step 3 — Create a service account

1. Go to **APIs & Services → Credentials**.
2. Click **Create credentials → Service account**.
3. Name it (e.g. `claras-sheet-sync`) and finish creation.
4. Open the new service account → **Keys** tab → **Add key → Create new key → JSON**.
5. Save the downloaded JSON file securely (e.g. `claras-sync-key.json`). **Do not commit this file.**

The JSON contains a field like `"client_email": "claras-sheet-sync@your-project.iam.gserviceaccount.com"` — you need that email for the next step.

### Step 4 — Share the sheet with the service account

1. Open **Clara's Day Dive — Site Content** in Google Sheets.
2. Click **Share**.
3. Add the service account email as **Viewer** (read-only is sufficient).
4. Uncheck "Notify people" if prompted — service accounts do not read email.
5. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Step 5 — Configure env vars locally or in CI

See [§3 Environment variables](#3-environment-variables) below.

---

## 3. Environment variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEET_ID` | Spreadsheet ID from the URL (`{SHEET_ID}` segment), or paste the **full Google Sheets URL** |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON key **string**, or **filesystem path** to the key file |
| `GOOGLE_CALENDAR_ID` | Optional override for `_Settings` `google_calendar_id` — calendar email or embed/iCal URL |

**Examples:**

```bash
# Sheet ID only (from URL)
export GOOGLE_SHEET_ID="1abc…xyz"

# Option A — path to key file
export GOOGLE_SERVICE_ACCOUNT_JSON="/path/to/claras-sync-key.json"

# Option B — inline JSON (common in GitHub Actions secrets)
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"…",…}'
```

**Local dev without a sheet:** Leave `GOOGLE_SHEET_ID` unset. The sync script logs a skip message and uses existing JSON in `src/content/` (exit 0).

**GitHub Actions / deploy:** Set both variables as repository secrets.

---

## 4. Run sync

```bash
npm run sync:content
```

On success, these files are written:

- `src/content/site.json`
- `src/content/drinks.json`
- `src/content/events.json`
- `src/content/whats-here.json`
- `src/content/faq.json`
- `src/content/knowledge.json`

Validation errors print tab + row number and exit with code 1 (blocking deploy).

---

## 5. Tab column definitions

Full header rows and field notes: [sheets-template/README.md](./sheets-template/README.md).

### `_Settings` (key / value rows)

Row 1: `key` | `value`

Site name, contact, SEO, Ask Clara UI strings, and `ask_clara_fallback` (used when Bedrock is unavailable). Both columns required on every row.

### `Hours`

Row 1: `day_group` | `display_label` | `opens` | `closes` | `sort_order` | `active`

- `opens` / `closes`: 24h `HH:MM` for JSON-LD schema
- `display_label`: shown in footer (e.g. `Mon–Thu · 3pm–12am`)

### `Drinks`

Row 1: `name` | `category` | `price` | `description` | `badge` | `sort_order` | `active`

**Adding drink categories:** Categories are derived automatically from unique `category` values on active rows. There is no separate categories tab or admin screen — staff simply type a new category name in the `category` column (e.g. `Spritz`, `Zero proof`). After sync, filter chips become `All` + sorted unique categories. No schema or code change required.

### `Events`

Events can come from the **`Events` sheet tab**, **Google Calendar**, or **both** (see [§6 Google Calendar for events](#6-google-calendar-for-events)).

**Sheet tab — row 1:** `title` | `start_datetime` | `end_datetime` | `tag` | `time_label` | `description` | `ticket_url` | `sort_order` | `active`

- Datetimes: `YYYY-MM-DD HH:MM` in **America/Chicago**
- `month` / `day` on the site are derived at sync — do not enter them in the sheet
- `ticket_url` optional → "Get tickets / RSVP →" when present

---

## 6. Google Calendar for events

If staff already maintain events in Google Calendar, point sync at that calendar instead of (or in addition to) the `Events` tab.

### Setup

1. Enable **Google Calendar API** in the same GCP project as the service account (see [§2](#2-google-service-account-setup)).
2. In Google Calendar, open **Settings → Integrate calendar** for the events calendar and copy the **Calendar ID** (often an `@group.calendar.google.com` address).
3. **Share the calendar** with the service account email (**See all event details** is enough).
4. In `_Settings`, add:
   - `google_calendar_id` — calendar ID, embed URL, or public iCal URL
   - `events_source` — `calendar` (default when calendar ID is set), `sheet`, or `both`

When `google_calendar_id` is set and `events_source` is omitted, sync uses **Google Calendar only**.

### Field mapping

| Google Calendar | Site (`events.json`) |
|-----------------|----------------------|
| Event title | `title` |
| Start / end | `start` / `end` (ISO, America/Chicago) |
| Description (body) | `desc` |
| — | `month` / `day` derived at sync |
| — | `timeLabel` from `TIME:` line or auto from start/end |

### Optional metadata lines in the event description

Put these on their own lines at the top of the event description (stripped from the public description):

```
TAG: Live music
TIME: 7–10pm · Free
TICKETS: https://partiful.com/your-event

Soul & disco on the turntable…
```

| Line prefix | Maps to |
|-------------|---------|
| `TAG:` | Event tag (default: `Event`) |
| `TIME:` or `TIME_LABEL:` | Display time string |
| `TICKETS:` or `RSVP:` | Ticket / RSVP button URL |

If no `TICKETS:` line, the first `https://` URL in the description is used.

### What still works on the site

All guest-facing calendar features read the same `events.json` after sync — **source does not matter**:

- Events list on the homepage
- **View all events →** Calendar Explorer modal
- **Subscribe to calendar** (build-time `/calendar/claras-day-dive.ics`)
- Per-event **Download .ics** and **Google Calendar** links
- **Get tickets / RSVP →** when a ticket URL is present

---

### `WhatsHere`

Row 1: `title` | `tag` | `body` | `icon` | `hours` | `website_url` | `order_url` | `sort_order` | `active`

- `icon`: `food-truck`, `coffee`, or `sun` (`truck` is accepted)
- `hours`: that vendor's hours (e.g. `Mon–Fri · 8am–2pm`)
- `website_url` / `order_url`: optional links for **Visit website** and **Order now**

### `FAQ`

Row 1: `question` | `answer` | `sort_order` | `active`

### `AskClara`

Row 1: `suggestion` | `response` | `sort_order` | `active`

- Chips shown on the Ask Clara section
- Exact chip matches use canned `response` with zero Bedrock cost

### `Knowledge` (optional)

Row 1: `topic` | `fact` | `keywords` | `sort_order` | `active`

Ask Clara-only venue facts — **not** shown on the public FAQ page. Each row becomes a RAG chunk so Clara can answer practical questions (restrooms, parking, coat check, etc.).

| Column | Required | Notes |
|--------|----------|-------|
| `topic` | Yes | Short label (e.g. `Restrooms`, `Parking`) |
| `fact` | Yes | What Clara should know — warm, conversational |
| `keywords` | No | Comma-separated extra match words (e.g. `bathroom,wc,parking lot`) |
| `sort_order` | No | Lower numbers first in sync |
| `active` | No | `FALSE` to hide |

If this tab is missing from an older workbook, sync still succeeds (empty knowledge).

---

## 7. Validation rules

The sync script fails (exit 1) if any row is invalid:

- Required fields empty
- `contact_email` not a valid email
- `price` not numeric
- Event `end_datetime` not after `start_datetime`
- Invalid datetime format (must be `YYYY-MM-DD HH:MM`)
- Invalid `icon` value on WhatsHere

Errors include tab name and row number (1-based sheet row, including header).

---

## 8. Publish workflow

### Manual publish (local)

After editing the sheet:

```bash
npm run sync:content && npm run deploy
```

`sync:content` pulls the sheet into JSON; `deploy` runs the SST build (which includes sync again) and deploys the static site + Ask Clara API.

After the **first** deploy, update `seo_site_url` in `_Settings` to the live SST URL, re-run the commands above, and redeploy so SEO and calendar links point to production.

### Automated publish (Publish site button)

Staff can publish from the sheet without a terminal:

1. Edit the workbook.
2. **Clara's Day Dive → Publish site** (Google Apps Script menu or toolbar button).
3. GitHub Actions runs sync + deploy (~5 minutes).

**One-time setup** (developer):

| Step | Doc |
|------|-----|
| Push repo to GitHub | [sheets-publish/README.md](./sheets-publish/README.md#1-push-the-repo-to-github) |
| Add GitHub Actions secrets (Sheet ID, service account, AWS) | [§ secrets](./sheets-publish/README.md#2-github-repository-secrets) |
| Paste Apps Script + set `GITHUB_TOKEN` / `GITHUB_REPO` | [§ Apps Script](./sheets-publish/README.md#5-install-apps-script-in-the-workbook) |

Workflow file: [`.github/workflows/publish.yml`](../.github/workflows/publish.yml)  
Apps Script source: [`docs/sheets-publish/PublishSite.gs`](./sheets-publish/PublishSite.gs)

---

## 9. AWS Bedrock — enable Nova Lite

Ask Clara uses **Amazon Nova Lite** (`amazon.nova-lite-v1:0`) via AWS Bedrock. Model access must be enabled in the same AWS account and region used for `sst deploy` (typically `us-east-1`).

### Enable model access

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) in the deploy region.
2. Open **Amazon Bedrock**.
3. Go to **Model access** (or **Bedrock configurations → Model access** in newer console layouts).
4. Click **Manage model access** / **Enable models**.
5. Find **Amazon Nova** → enable **Nova Lite** (`amazon.nova-lite-v1:0`).
6. Optionally enable **Claude Haiku** as a fallback — set `BEDROCK_MODEL_ID` in `sst.config.ts` if switching models.
7. Wait for access status to show **Access granted** (can take a few minutes).

### SST / Lambda permissions

`sst.config.ts` grants the Ask Clara Lambda `bedrock:InvokeModel`. No extra IAM setup is required beyond successful model access and valid AWS credentials for deploy.

### Verify after deploy

- SST outputs `api` URL — the static site receives it as `VITE_ASK_CLARA_API_URL` at build time.
- Test Ask Clara on the deployed site with a free-form question (not a suggestion chip).

---

## 10. Ask Clara — $5/month budget

Live Ask Clara calls are capped at **$5 USD per calendar month** (configurable via `ASK_CLARA_MONTHLY_BUDGET_USD`, default `5` in `sst.config.ts`).

| Behavior | Detail |
|----------|--------|
| Tracking | DynamoDB table `AskClaraUsage`, partition key `YYYY-MM` |
| Hard stop | Before any Bedrock call, if monthly spend ≥ budget → refuse (no LLM charge) |
| Guest message | *"I'm taking a quick break — check the menu above or ask the bar team when you're in. See you on the patio!"* |
| Alerts | CloudWatch warning at 80% ($4); optional AWS Budget on Bedrock at $4 and $5 |
| Reset | Automatic each calendar month (new partition key) |
| Free paths | Suggestion chip exact matches use canned `AskClara` tab responses — **zero Bedrock cost** |

Classifier and main model calls both count toward the budget. Chip taps and sync-generated knowledge chunks do not.

---

## 11. Related docs

| Doc | Contents |
|-----|----------|
| [sheets-template/README.md](./sheets-template/README.md) | Copy-paste column headers per tab |
| [superpowers/specs/2026-06-25-claras-demo-design.md](./superpowers/specs/2026-06-25-claras-demo-design.md) | Full platform spec (§3 Sheets, §6 Ask Clara, §7 budget) |

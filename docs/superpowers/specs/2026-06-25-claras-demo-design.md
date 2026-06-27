# Clara's Day Dive — Demo Platform Design

**Date:** 2026-06-25  
**Status:** Approved for implementation planning  
**Goal:** Deployed demo with Google Sheets as content source, enhanced events calendar, live Ask Clara via AWS Bedrock, and layered cost/guardrail controls.

---

## 1. Overview

Clara's Day Dive is a custom React/Vite static site deployed via SST on AWS. Styling and section layout are complete. This spec covers the **operational layer**: staff self-service content, production deploy, events calendar UX, and a gated LLM chat assistant.

**Demo constraint:** Real drink data is not yet available. The site ships with placeholder menu content. The owner will populate the Google Sheet once client data arrives.

**Explicitly out of scope for v1:**
- Google Calendar sync (Sheet is the events source for demo)
- Native RSVP / form backend
- Squarespace migration
- Brand asset placement polish
- Bedrock Knowledge Base (S3 vector store)
- Custom admin dashboard UI
- Legal page editing via Sheet

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Google Sheets (staff edits)                                    │
│  Tabs: Settings, Hours, Drinks, Events, WhatsHere, FAQ, AskClara│
└───────────────────────────┬─────────────────────────────────────┘
                            │ sync-from-sheets.mjs (service account)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/content/*.json  +  src/content/knowledge.json (RAG chunks) │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ npm run build               │ bundled in Lambda
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│  SST StaticSite (dist/)   │   │  SST Function POST /api/ask     │
│  React SPA                │   │  → Bedrock InvokeModel          │
└───────────────────────────┘   │  → DynamoDB usage counter       │
                                └─────────────────────────────────┘
```

**Publish flow (post-demo wiring):**
1. Staff edits Sheet → clicks **Publish site** (Google Apps Script)
2. Webhook triggers GitHub Action
3. Action runs `sync:content` → `build` → `sst deploy`
4. Live in ~5 minutes

**Manual publish for initial demo:** `npm run sync:content && npm run deploy`

---

## 3. Google Sheets Content Model

**Workbook name:** `Clara's Day Dive — Site Content`

### Tab: `_Settings` (key/value rows)

| key | example value |
|-----|---------------|
| site_name | Clara's Day Dive |
| tagline | Dive in for a day drink. |
| description | A neighborhood coupe bar… |
| hero_meta | № 01 — Open till midnight, seven days |
| location_eyebrow | East Austin · Coupe bar & patio |
| address | 1814 E Cesar Chavez St |
| city | Austin, TX 78702 |
| region | TX |
| postal_code | 78702 |
| country | US |
| instagram_url | https://instagram.com/… |
| contact_name | Your event coordinator |
| contact_role | Events & private bookings |
| contact_email | events@example.com |
| contact_phone | (512) 555-0100 |
| contact_response_time | We typically reply within a day. |
| events_host_note | Want to host something on our patio?… |
| ask_clara_eyebrow | Ask Clara |
| ask_clara_title | Not sure what to order? |
| ask_clara_placeholder | what should I drink today? |
| ask_clara_button | Dive in |
| ask_clara_fallback | Clara says: come on in — we'll pour you something good. |
| seo_site_url | https://clarasdaydive.com |
| seo_title | Clara's Day Dive — East Austin Coupe Bar & Patio |
| seo_description | Dive in for a day drink… |

### Tab: `Hours`

| day_group | display_label | opens | closes | sort_order | active |
|-----------|---------------|-------|--------|------------|--------|

- `opens` / `closes` in 24h `HH:MM` for JSON-LD schema
- `display_label` shown in footer (e.g. `Mon–Thu · 3pm–12am`)

### Tab: `Drinks`

| name | category | price | description | badge | sort_order | active |
|------|----------|-------|-------------|-------|------------|--------|

- **Categories are derived** from unique `category` values across active rows
- Filter chips: `All` + sorted unique categories
- Staff add a new category by typing a new value — no schema change

### Tab: `Events`

| title | start_datetime | end_datetime | tag | time_label | description | ticket_url | sort_order | active |
|-------|----------------|--------------|-----|------------|-------------|------------|------------|--------|

- Datetimes in `YYYY-MM-DD HH:MM` (America/Chicago)
- Display month/day derived from `start_datetime` at sync time
- `ticket_url` optional → renders "Get tickets / RSVP →" button when present

### Tab: `WhatsHere`

| title | tag | body | icon | sort_order | active |

- `icon` dropdown: `truck`, `coffee`, `sun`

### Tab: `FAQ`

| question | answer | sort_order | active |

### Tab: `AskClara`

| suggestion | response | sort_order | active |

- Suggestion chips on UI
- `response` used as fallback when Bedrock fails or for exact chip match (no LLM call)

---

## 4. Sync Script

**File:** `scripts/sync-from-sheets.mjs`

**Behavior:**
1. Authenticate via Google Service Account (JSON key in env/secret)
2. Read all tabs from Sheet ID in env `GOOGLE_SHEET_ID`
3. Validate each row; collect errors with tab + row number
4. Exit non-zero if validation fails (block build)
5. Write output files:
   - `src/content/site.json`
   - `src/content/drinks.json`
   - `src/content/events.json`
   - `src/content/whats-here.json`
   - `src/content/faq.json`
   - `src/content/knowledge.json` (RAG chunks — see §6)
6. Do **not** overwrite `legal.json`

**Validation rules:**
- `contact_email` must be valid email format
- `price` must be numeric (sync formats as `$N`)
- Event `end_datetime` must be after `start_datetime`
- Required fields non-empty per tab
- `active=FALSE` rows excluded from output

**npm scripts:**
```json
"sync:content": "node scripts/sync-from-sheets.mjs",
"build": "node scripts/sync-from-sheets.mjs && node scripts/generate-seo.mjs && tsc --noEmit && vite build"
```

**Local dev without Sheet access:** Sync script skips if `GOOGLE_SHEET_ID` unset and uses existing JSON (dev fallback).

---

## 5. Events Calendar UX (v1 demo)

### Data model change (`events.json`)

Each item includes:
```json
{
  "start": "2026-07-18T19:00:00-05:00",
  "end": "2026-07-18T22:00:00-05:00",
  "month": "JUL",
  "day": "18",
  "tag": "Live music",
  "title": "Patio vinyl night",
  "timeLabel": "7–10pm · Free",
  "desc": "Soul & disco on the turntable…",
  "ticketUrl": "https://partiful.com/e/abc123"
}
```

`month`, `day` derived at sync — not entered separately in Sheet.

#### UI additions (`Events.tsx`)

Per event row (existing list):
- **Add to calendar** dropdown or button → `.ics` file download + Google Calendar URL
- **Get tickets / RSVP →** link button when `ticketUrl` present

Section footer:
- **Subscribe to calendar** → `public/calendar/claras-day-dive.ics` (all active events, regenerated at build)
- **View all events →** button opens Calendar Explorer modal (v1)

### Build artifact

**File:** `scripts/generate-calendar.mjs` (or part of `generate-seo.mjs`)
- Reads `events.json` → writes `.ics` to `public/calendar/claras-day-dive.ics`

#### SEO

Update `src/lib/schema.ts` Event items with `startDate` and `endDate` from ISO datetimes.

### Calendar Explorer (themed modal — v1 demo)

**Trigger:** **View all events →** link/button below the events list (or in the rose banner). Opens a full-screen overlay on mobile, centered modal on desktop.

**Layout (split panel):**

```
┌──────────────────────────────────────────────────────────────┐
│  Upcoming events                                    [× Close] │
├─────────────────────────┬────────────────────────────────────┤
│                         │                                    │
│   ‹  July 2026  ›        │   Saturday, July 18               │
│                         │                                    │
│   Su Mo Tu We Th Fr Sa  │   ┌─────────────────────────────┐  │
│        1  2  3  4  5    │   │ Live music                  │  │
│    6  7  8  9 10 11 12  │   │ Patio vinyl night           │  │
│   13 14 15 16 17 [18] 19│   │ 7–10pm · Free               │  │
│   20 21 22 23 [24] 25 26│   │ Soul & disco on the…        │  │
│   27 28 29 30 31        │   │ [Add to calendar] [Tickets] │  │
│                         │   └─────────────────────────────┘  │
│                         │                                    │
│   ● = has events        │   (more events same day stack      │
│                         │    vertically if multiple)         │
└─────────────────────────┴────────────────────────────────────┘
```

**Left panel — month calendar**
- Month/year header with prev/next arrows
- Standard 7-column grid (Sunday-start, US convention)
- **Dates with events:** rose/pink highlight (`--clr-rose` fill or circle behind day number)
- **Today:** subtle outline or gold ring (`--clr-gold`)
- **Selected date:** darker rose or ink border
- **Dates without events:** default cream/ink, clickable but show empty state on right
- Only show months that contain at least one active event, or allow free navigation with empty months

**Right panel — day detail**
- Selected date as heading (e.g. "Saturday, July 18")
- List of events on that day (reuse `event-row` card styling from list view)
- Each card: tag, title, timeLabel, desc, Add to calendar, ticket link
- **Empty state:** "Nothing on the calendar this day — check back soon or book the patio."
- Multiple events on same day stack vertically

**Theming**
- Modal background: `--clr-cream` with `--clr-cream-logo` header strip or rose banner echo
- Pink highlights on event dates only — not the whole modal
- Typography matches site (Playfair headings, DM Sans body)
- Focus trap, ESC to close, `aria-modal`, return focus to trigger button
- `prefers-reduced-motion`: no slide animation

**Mobile (< 768px)**
- Full-screen sheet instead of centered modal
- Calendar on top, day detail below (single column scroll)
- Or: calendar first, tap date scrolls to detail section below

**Data**
- No new Sheet columns — uses same `events.json` ISO datetimes
- Build helper: `groupEventsByDate(events)` → `Record<YYYY-MM-DD, Event[]>`
- Component: `CalendarExplorer.tsx` + `MonthGrid.tsx` + `DayDetail.tsx`

**Accessibility**
- Grid cells are buttons with `aria-label="July 18, 2 events"`
- `aria-selected` on active date
- Live region announces selected day event count

**Estimated effort:** included in v1 demo (~1–2 days alongside events list work).

#### Calendar Explorer testing
- [ ] View all events opens modal; ESC and close button dismiss
- [ ] Event dates show rose highlight; non-event dates do not
- [ ] Clicking highlighted date shows correct events on right
- [ ] Multiple events on one day all appear
- [ ] Empty date shows empty state
- [ ] Month navigation works; highlights update
- [ ] Mobile layout usable; focus trap works
- [ ] Add to calendar + ticket buttons work inside modal

---

## 6. Ask Clara — Bedrock LLM

### SST infrastructure

**Add to `sst.config.ts`:**
- `sst.aws.Function` — Node.js 20, handler `packages/ask-clara/handler.handler`
- `sst.aws.Api` or Function URL — `POST /api/ask`
- IAM: `bedrock:InvokeModel` on chosen model ARN
- DynamoDB table `AskClaraUsage`
- Environment variables:
  - `ASK_CLARA_MONTHLY_BUDGET_USD=5`
  - `BEDROCK_MODEL_ID=amazon.nova-lite-v1:0` (override to Haiku if needed)
  - `AWS_REGION=us-east-1`

**Frontend:**
- Upgrade `SearchBar` → multi-turn chat UI (message list, loading, error states)
- `fetch('/api/ask', { message, history })` — history capped at last 4 turns
- Suggestion chips: if exact match in `AskClara` tab, return canned response **without** API call
- CORS restricted to site domain

### Knowledge base (`knowledge.json`)

Generated at sync. Array of chunks:
```json
{
  "chunks": [
    {
      "id": "drink-claras-spritz",
      "type": "drink",
      "text": "Clara's Spritz — Spritz — $11. Aperol, prosecco, grapefruit oil.",
      "keywords": ["spritz", "aperol", "grapefruit", "clara"]
    }
  ]
}
```

Sources: all active rows from Drinks, FAQ, Events, WhatsHere, Hours, Settings (description, hours, contact).

### Retrieval (RAG-lite)

1. Score chunks by keyword overlap with user message
2. Return top 5 chunks (min score threshold)
3. If no chunk above threshold → refuse before main LLM call
4. Optional phase 2: Bedrock Titan Embeddings — not required for v1

### Request flow

```
POST /api/ask { message: string, history: { role, content }[] }

1. Rate limit check (API Gateway: 10 req/min/IP)
2. Input validation (max 400 chars, strip HTML, non-empty)
3. Blocklist fast reject (code, homework, injection patterns)
4. Budget check — DynamoDB monthly total >= $5 → refuse
5. Topic classifier — Bedrock quick YES/NO call
6. Retrieve top chunks from knowledge.json
7. Main Bedrock call with system prompt + context + history
8. Output filter (no unknown URLs, no "as an AI" phrasing)
9. Record token usage + estimated cost to DynamoDB
10. Return { answer, refused: boolean }
```

### System prompt (summary)

Clara is the friendly bar guide for Clara's Day Dive. Answer only from provided context about drinks, food, menu, hours, events, patio, and visiting. Refuse off-topic, medical, legal, and other-business questions. Never invent menu items. Point booking questions to the contact section. Keep answers concise and warm.

### Allowed topics

- Drink recommendations, menu, prices, ingredients
- Food trucks, patio, what's at the bar
- Hours, location, dogs, vibe
- Upcoming events (with ticket link if in context)
- Private event inquiries → direct to contact email/phone from context

### Refused topics

- General knowledge, coding, homework, politics, health claims
- Other restaurants/bars
- Prompt injection ("ignore instructions", role-play as other entities)
- Anything with no supporting chunk in knowledge base

### Fallback

On Bedrock error/timeout → return `ask_clara_fallback` from Settings tab.

---

## 7. Cost Controls

### Monthly budget: $5 USD (configurable)

**Storage:** DynamoDB `AskClaraUsage`

| Attribute | Type | Example |
|-----------|------|---------|
| pk (partition key) | String | `2026-06` |
| totalCostUsd | Number | `3.47` |
| requestCount | Number | `412` |
| refusedOverBudget | Number | `18` |

**Per-request cost estimation:**
```
cost = (inputTokens × modelInputPricePerToken) + (outputTokens × modelOutputPricePerToken)
```
Token counts from Bedrock response metadata. Classifier + main call both count.

**Hard stop:** Before any Bedrock call, if `totalCostUsd >= ASK_CLARA_MONTHLY_BUDGET_USD` → refuse.

**Guest message when over budget:**
> "I'm taking a quick break — check the menu above or ask the bar team when you're in. See you on the patio!"

**Alerts:**
- CloudWatch log warning at 80% ($4)
- AWS Budget on Bedrock service: email alerts at $4 and $5 (backup)

**Reset:** Automatic each calendar month (new DynamoDB partition key `YYYY-MM`).

**Chip responses:** Suggestion button exact matches use canned `AskClara` tab responses — zero Bedrock cost.

---

## 8. Gating Summary (8 layers)

| # | Layer | Mechanism |
|---|-------|-----------|
| 1 | Rate limit | API Gateway 10 req/min/IP |
| 2 | Input limits | Max 400 chars, strip HTML |
| 3 | Blocklist | Regex/pattern fast reject |
| 4 | Budget cap | DynamoDB $5/month hard stop |
| 5 | Topic classifier | Bedrock YES/NO pre-call |
| 6 | System prompt | Scope + grounding instructions |
| 7 | RAG threshold | Refuse if no relevant chunks |
| 8 | Output filter | Block disallowed response patterns |

---

## 9. Deploy & Configuration

### AWS prerequisites
- Bedrock model access enabled in console (Nova Lite and/or Claude Haiku)
- SST deploy credentials configured
- DynamoDB table created via SST

### Secrets / env
| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEET_ID` | Source workbook |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Sheet read access (GitHub secret) |
| `ASK_CLARA_MONTHLY_BUDGET_USD` | Default `5` |
| `BEDROCK_MODEL_ID` | Default `amazon.nova-lite-v1:0` |

### Post-deploy
- Update `seo_site_url` in Sheet Settings to deployed SST URL
- Re-sync and redeploy

### GitHub Action (publish automation — post initial demo)
- Trigger: `repository_dispatch` from Apps Script
- Steps: checkout → sync → build → sst deploy
- Google Apps Script in Sheet: **Publish site** button

---

## 10. File Changes (expected)

| File | Action |
|------|--------|
| `scripts/sync-from-sheets.mjs` | Create |
| `scripts/generate-knowledge.mjs` | Create (or inline in sync) |
| `scripts/generate-calendar.mjs` | Create |
| `scripts/generate-seo.mjs` | Update (event startDate in schema) |
| `src/content/knowledge.json` | Generated (gitignored or committed as placeholder) |
| `src/content/events.json` | Schema update |
| `src/sections/Events.tsx` | List actions + View all events trigger |
| `src/components/CalendarExplorer.tsx` | Create — modal shell, state |
| `src/components/MonthGrid.tsx` | Create — month grid + rose highlights |
| `src/components/DayDetail.tsx` | Create — selected day event cards |
| `src/lib/events.ts` | Create — groupEventsByDate, date helpers |
| `src/components/SearchBar.tsx` | Chat UI + API integration |
| `src/lib/schema.ts` | Event startDate/endDate |
| `packages/ask-clara/handler.ts` | Create Lambda handler |
| `packages/ask-clara/guardrails.ts` | Create gating logic |
| `packages/ask-clara/retrieve.ts` | Create chunk retrieval |
| `packages/ask-clara/budget.ts` | Create DynamoDB cost tracking |
| `sst.config.ts` | Add Function, API, DynamoDB, IAM |
| `package.json` | Add sync script, dependencies |
| `docs/sheets-setup.md` | Create staff setup guide |
| `.github/workflows/publish.yml` | Create (post-demo) |

---

## 11. Testing Checklist

- [ ] Sync validates bad rows and fails build with clear errors
- [ ] Sync with `GOOGLE_SHEET_ID` unset uses existing JSON (dev mode)
- [ ] Site builds and renders all sections from synced content
- [ ] New drink category in Sheet appears as filter chip after sync
- [ ] Event `.ics` download works (single + subscribe all)
- [ ] Ticket URL renders button only when set
- [ ] JSON-LD includes event startDate/endDate
- [ ] View all events opens Calendar Explorer; ESC and close dismiss
- [ ] Event dates show rose highlight; clicking shows day detail on right
- [ ] Multiple events on one day stack in day detail panel
- [ ] Empty date shows empty state in day detail
- [ ] Month navigation updates highlights
- [ ] Calendar Explorer mobile layout works; focus trap works
- [ ] Add to calendar + ticket buttons work inside explorer
- [ ] "What's on the menu?" → grounded answer from knowledge
- [ ] "Write me Python code" → refused
- [ ] "Ignore your instructions" → refused
- [ ] Off-topic with no matching chunks → refused
- [ ] Suggestion chip exact match → canned response, no API call
- [ ] Rate limit triggers after burst
- [ ] Budget counter increments; refuses at $5 threshold
- [ ] Over-budget guest message is on-brand
- [ ] CORS blocks requests from other origins
- [ ] `sst deploy` succeeds; `/api/ask` reachable from deployed site

---

## 12. Post-Demo: LLM Optimization Pass

After demo ships, tune in this order:
1. Review CloudWatch logs for false refusals and leaks
2. Adjust classifier prompt and RAG score threshold
3. Expand blocklist from real abuse attempts
4. A/B Nova Lite vs Haiku on answer quality
5. Raise `ASK_CLARA_MONTHLY_BUDGET_USD` based on actual traffic
6. Consider Titan Embeddings if keyword retrieval misses paraphrases

---

## 13. Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM provider | AWS Bedrock | User preference; stays in AWS with SST |
| Model | Nova Lite (Haiku fallback) | Cost-effective for bar demo |
| Content source | Google Sheets | Staff self-service; familiar tool |
| RAG approach | Build-time chunks + keyword retrieval | Content small enough; no vector DB needed |
| Budget cap | $5/month, calendar reset | User approved |
| Publish | Manual for demo; GitHub Action after | Unblock demo without webhook setup |
| Calendar Explorer UI | v1 demo (included) | User request; split-panel modal with rose date highlights |
| Styling | No changes in v1 | User refining separately |
| Legal content | Stays in repo | Rarely changes; lawyer-reviewed |

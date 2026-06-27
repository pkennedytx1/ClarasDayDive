# Clara's Day Dive Demo Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed demo with Google Sheets content sync, enhanced events (list + Calendar Explorer modal + `.ics`), and live Ask Clara via AWS Bedrock with $5/month budget cap and 8-layer gating.

**Architecture:** Sheet sync writes `src/content/*.json` + `knowledge.json` at build time. Static React site on SST StaticSite. Ask Clara POST `/api/ask` on SST Lambda reads bundled knowledge, calls Bedrock Nova Lite, tracks spend in DynamoDB.

**Tech Stack:** Vite + React + TypeScript, SST v3, AWS Bedrock, DynamoDB, Google Sheets API (service account), Node 20.

## Global Constraints

- Timezone for events: `America/Chicago`
- Bedrock model default: `amazon.nova-lite-v1:0`
- Monthly LLM budget: `ASK_CLARA_MONTHLY_BUDGET_USD=5` (calendar month reset)
- Rate limit: 10 req/min/IP on `/api/ask`
- Max user message: 400 chars
- RAG history cap: last 4 turns
- Sync skips (dev fallback) when `GOOGLE_SHEET_ID` unset
- Do not overwrite `legal.json` from sync
- Styling: use existing CSS tokens; no brand mark placement changes
- Sunday-start calendar grid (US convention)

**Spec reference:** `docs/superpowers/specs/2026-06-25-claras-demo-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/lib/events.ts` | Date helpers, `groupEventsByDate`, ICS URL builders |
| `src/lib/ics.ts` | Single-event and feed `.ics` string generation |
| `src/content/events.json` | ISO datetimes + display fields |
| `scripts/generate-calendar.mjs` | Write `public/calendar/claras-day-dive.ics` at build |
| `scripts/sync-from-sheets.mjs` | Sheet → JSON + knowledge |
| `src/components/EventActions.tsx` | Add to calendar + ticket buttons (reused in list + explorer) |
| `src/components/CalendarExplorer.tsx` | Modal shell, open/close, selected date state |
| `src/components/MonthGrid.tsx` | Month nav + rose-highlighted day cells |
| `src/components/DayDetail.tsx` | Events for selected day |
| `packages/ask-clara/handler.ts` | Lambda entry |
| `packages/ask-clara/guardrails.ts` | Blocklist, classifier, output filter |
| `packages/ask-clara/retrieve.ts` | Keyword chunk scoring |
| `packages/ask-clara/budget.ts` | DynamoDB cost tracking |
| `packages/ask-clara/prompts.ts` | System + classifier prompts |
| `sst.config.ts` | StaticSite + Api + Function + DynamoDB |

---

### Task 1: Event data model and helpers

**Files:**
- Create: `src/lib/events.ts`
- Create: `src/lib/ics.ts`
- Modify: `src/content/events.json`
- Modify: `src/lib/content.ts` (export event types if needed)

**Interfaces:**
- Produces:
  - `export interface SiteEvent { start: string; end: string; month: string; day: string; tag: string; title: string; timeLabel: string; desc: string; ticketUrl?: string }`
  - `export function groupEventsByDate(events: SiteEvent[]): Record<string, SiteEvent[]>`
  - `export function toDateKey(iso: string): string` → `YYYY-MM-DD`
  - `export function buildGoogleCalendarUrl(event: SiteEvent, location: string): string`
  - `export function buildIcsContent(events: SiteEvent[], location: string, calName: string): string`

- [ ] **Step 1: Update `events.json` with ISO datetimes**

```json
{
  "items": [
    {
      "start": "2026-07-18T19:00:00-05:00",
      "end": "2026-07-18T22:00:00-05:00",
      "month": "JUL",
      "day": "18",
      "tag": "Live music",
      "title": "Patio vinyl night",
      "timeLabel": "7–10pm · Free",
      "desc": "Soul & disco on the turntable, frosé specials all night."
    }
  ],
  "hostNote": "Want to host something on our patio? Reach out below — we'd love to hear your idea."
}
```

- [ ] **Step 2: Implement `src/lib/events.ts`**

```typescript
export interface SiteEvent {
  start: string;
  end: string;
  month: string;
  day: string;
  tag: string;
  title: string;
  timeLabel: string;
  desc: string;
  ticketUrl?: string;
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function groupEventsByDate(events: SiteEvent[]): Record<string, SiteEvent[]> {
  return events.reduce<Record<string, SiteEvent[]>>((acc, event) => {
    const key = toDateKey(event.start);
    (acc[key] ??= []).push(event);
    return acc;
  }, {});
}

export function formatDayHeading(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function buildGoogleCalendarUrl(event: SiteEvent, location: string): string {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace('.000', '').slice(0, 15) + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.start)}/${fmt(event.end)}`,
    details: event.desc,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
```

- [ ] **Step 3: Implement `src/lib/ics.ts`** (VEVENT per RFC 5545, CRLF line endings)

```typescript
import type { SiteEvent } from './events';

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcsContent(events: SiteEvent[], location: string, calName: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const vevents = events.map((e, i) => [
    'BEGIN:VEVENT',
    `UID:claras-${e.start}-${i}@clarasdaydive.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${e.start.replace(/[-:]/g, '').replace('.000', '')}`,
    `DTEND:${e.end.replace(/[-:]/g, '').replace('.000', '')}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.desc)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
  ].join('\r\n')).join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//Clara's Day Dive//EN`, `X-WR-CALNAME:${escapeIcs(calName)}`, vevents, 'END:VCALENDAR'].join('\r\n');
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS (no type errors)

---

### Task 2: Build-time `.ics` generation and JSON-LD

**Files:**
- Create: `scripts/generate-calendar.mjs`
- Modify: `scripts/generate-seo.mjs` or `package.json` build script
- Modify: `src/lib/schema.ts`

**Interfaces:**
- Consumes: `src/content/events.json`, `src/content/site.json`

- [ ] **Step 1: Create `scripts/generate-calendar.mjs`**

Reads events + site location, writes `public/calendar/claras-day-dive.ics`. Reuse same VEVENT logic as `ics.ts` (duplicate in mjs for build script — keep in sync).

- [ ] **Step 2: Add to build chain**

```json
"build": "node scripts/sync-from-sheets.mjs && node scripts/generate-calendar.mjs && node scripts/generate-seo.mjs && tsc --noEmit && vite build"
```

- [ ] **Step 3: Update `schema.ts` Event items**

Add `startDate: event.start` and `endDate: event.end` to each Event in `itemListElement`.

- [ ] **Step 4: Verify**

Run: `npm run build && ls public/calendar/claras-day-dive.ics`
Expected: file exists, contains `BEGIN:VCALENDAR`

---

### Task 3: Event actions component (list view)

**Files:**
- Create: `src/components/EventActions.tsx`
- Modify: `src/sections/Events.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: `SiteEvent`, `buildGoogleCalendarUrl`, `buildIcsContent`
- Produces: `EventActions({ event, location }: { event: SiteEvent; location: string })`

- [ ] **Step 1: Create `EventActions.tsx`**

Buttons:
- **Add to calendar** — dropdown or two links: Download `.ics` (blob download) + Google Calendar
- **Get tickets / RSVP →** — external link, only if `event.ticketUrl`

- [ ] **Step 2: Wire into `Events.tsx` list rows**

Add `EventActions` below each `event-row__desc`.

- [ ] **Step 3: Add section footer links**

- **Subscribe to calendar** → `<a href="/calendar/claras-day-dive.ics" download>`
- **View all events →** → `button` sets `explorerOpen` state (Task 4)

- [ ] **Step 4: CSS for `.event-actions`**

Small pill buttons matching existing `.btn` patterns; rose for ticket link.

- [ ] **Step 5: Verify in dev**

Run: `npm run dev` — confirm buttons render on event rows.

---

### Task 4: Calendar Explorer modal

**Files:**
- Create: `src/components/CalendarExplorer.tsx`
- Create: `src/components/MonthGrid.tsx`
- Create: `src/components/DayDetail.tsx`
- Modify: `src/sections/Events.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: `groupEventsByDate`, `formatDayHeading`, `SiteEvent[]`, `EventActions`
- Produces:
  - `CalendarExplorer({ events, location, open, onClose }: { events: SiteEvent[]; location: string; open: boolean; onClose: () => void })`
  - `MonthGrid({ month, year, eventDates, selectedDate, onSelectDate, onPrevMonth, onNextMonth })`
  - `DayDetail({ date, events, location })`

- [ ] **Step 1: Implement `MonthGrid.tsx`**

- Build 42-cell grid for month (Sunday-start)
- Props: `Set<string>` of `YYYY-MM-DD` keys with events
- Rose circle/background on dates in set (`--clr-rose`)
- Gold ring on today (`--clr-gold`)
- Ink border on selected date
- Each cell: `<button type="button" aria-label="July 18, 1 event" aria-selected={...}>`

- [ ] **Step 2: Implement `DayDetail.tsx`**

- Heading via `formatDayHeading(date)`
- Map events to compact cards (reuse event-row card classes)
- Include `EventActions` per card
- Empty state copy from spec

- [ ] **Step 3: Implement `CalendarExplorer.tsx`**

- Fixed overlay + centered panel (desktop); full-screen sheet (mobile `@media max-width: 768px`)
- Split grid: `grid-template-columns: 1fr 1fr` desktop; single column mobile
- State: `viewMonth`, `viewYear`, `selectedDate`
- On open: select first upcoming event date or today
- Focus trap, ESC closes, return focus to trigger
- `role="dialog" aria-modal="true" aria-labelledby="calendar-explorer-title"`

- [ ] **Step 4: Wire in `Events.tsx`**

```tsx
const [explorerOpen, setExplorerOpen] = useState(false);
// ...
<button type="button" className="events-view-all" onClick={() => setExplorerOpen(true)}>
  View all events →
</button>
<CalendarExplorer
  events={events.items}
  location={`${site.location.address}, ${site.location.city}`}
  open={explorerOpen}
  onClose={() => setExplorerOpen(false)}
/>
```

- [ ] **Step 5: CSS `.calendar-explorer` block**

Modal, grid, day cells, split panel — cream background, rose highlights only on event dates.

- [ ] **Step 6: Verify**

Manual: open modal, navigate months, click rose dates, confirm right panel updates, ESC closes, mobile layout stacks.

---

### Task 5: Google Sheets sync script

**Files:**
- Create: `scripts/sync-from-sheets.mjs`
- Create: `docs/sheets-setup.md`
- Create: `docs/sheets-template/` (CSV exports or setup instructions per tab)
- Modify: `package.json`

**Interfaces:**
- Produces: all `src/content/*.json` except `legal.json`, plus `knowledge.json`

- [ ] **Step 1: Add dependency**

```bash
npm install googleapis
```

- [ ] **Step 2: Implement sync with dev fallback**

```javascript
if (!process.env.GOOGLE_SHEET_ID) {
  console.log('GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON');
  process.exit(0);
}
```

- [ ] **Step 3: Read tabs and map to JSON**

Implement parsers for: `_Settings`, `Hours`, `Drinks`, `Events`, `WhatsHere`, `FAQ`, `AskClara`.

Key mappings:
- Settings key/value → nested `site.json` structure
- Drinks → derive `categories: ['All', ...unique categories sorted]`
- Events → parse datetimes to ISO with `America/Chicago`, derive `month`/`day`
- AskClara → `site.search.suggestions[]` + `site.search.responses{}`

- [ ] **Step 4: Validation with row-level errors**

Collect errors array; `process.exit(1)` with formatted output if any.

- [ ] **Step 5: Write `docs/sheets-setup.md`**

Steps: create workbook, share with service account email, set env vars, column definitions per tab.

- [ ] **Step 6: Verify dev fallback**

Run: `npm run sync:content` (no env) → exits 0, JSON unchanged.

---

### Task 6: Knowledge chunk generation

**Files:**
- Modify: `scripts/sync-from-sheets.mjs` (or create `scripts/generate-knowledge.mjs`)
- Create: `src/content/knowledge.json` (placeholder committed for dev)

**Interfaces:**
- Produces: `{ chunks: Array<{ id: string; type: string; text: string; keywords: string[] }> }`

- [ ] **Step 1: Generate chunks from all content**

Types: `drink`, `faq`, `event`, `here`, `hours`, `settings`.

Example drink chunk:
```json
{
  "id": "drink-claras-spritz",
  "type": "drink",
  "text": "Clara's Spritz (Spritz) — $11. House badge. Aperol, prosecco, grapefruit oil.",
  "keywords": ["spritz", "aperol", "grapefruit", "clara", "drink", "menu"]
}
```

- [ ] **Step 2: Commit placeholder `knowledge.json`** for local dev without sync.

- [ ] **Step 3: Verify chunk count**

Run sync (or manual generate) → confirm chunks cover all menu items + FAQ entries.

---

### Task 7: Ask Clara Lambda backend

**Files:**
- Create: `packages/ask-clara/handler.ts`
- Create: `packages/ask-clara/guardrails.ts`
- Create: `packages/ask-clara/retrieve.ts`
- Create: `packages/ask-clara/budget.ts`
- Create: `packages/ask-clara/prompts.ts`
- Create: `packages/ask-clara/knowledge.json` (copied at build or imported from src/content)

**Interfaces:**
- Produces: `handler(event: APIGatewayProxyEventV2): Promise<{ statusCode: number; body: string }>`
- Response body: `{ answer: string; refused: boolean }`

- [ ] **Step 1: Implement `budget.ts`**

```typescript
export async function checkBudget(tableName: string, budgetUsd: number): Promise<{ allowed: boolean; current: number }>
export async function recordUsage(tableName: string, costUsd: number, inputTokens: number, outputTokens: number): Promise<void>
```

DynamoDB pk = `YYYY-MM`.

- [ ] **Step 2: Implement `retrieve.ts`**

```typescript
export function retrieveChunks(query: string, chunks: KnowledgeChunk[], limit?: number): KnowledgeChunk[]
```

Keyword overlap scoring; min score threshold 1.

- [ ] **Step 3: Implement `guardrails.ts`**

- `validateInput(message: string): string | null` — error reason or null
- `blocklistCheck(message: string): boolean`
- `classifyTopic(bedrock, message): Promise<boolean>` — YES/NO Bedrock call
- `filterOutput(text: string): string`

Blocklist patterns: `/ignore (all )?previous/i`, `/write (me )?(code|python|essay)/i`, etc.

- [ ] **Step 4: Implement `prompts.ts`**

System prompt per spec §6. Classifier prompt: single YES/NO line.

- [ ] **Step 5: Implement `handler.ts`**

Flow per spec §6 request flow. Import knowledge.json. Use `@aws-sdk/client-bedrock-runtime`.

Refusal messages:
- Off-topic: `"I'm only here for drinks and what's on at Clara's — ask me about the menu, patio, or hours."`
- Over budget: `"I'm taking a quick break — check the menu above or ask the bar team when you're in. See you on the patio!"`

- [ ] **Step 6: Local smoke test** (optional script `scripts/test-ask-clara.mjs` invoking handler with mock event)

---

### Task 8: SST infrastructure

**Files:**
- Modify: `sst.config.ts`
- Modify: `vite.config.ts` (proxy `/api` to local lambda in dev if using sst dev)

**Interfaces:**
- Produces: deployed `POST /api/ask`, DynamoDB table, StaticSite with linked API URL

- [ ] **Step 1: Add DynamoDB table**

```typescript
const usage = new sst.aws.Dynamo('AskClaraUsage', {
  fields: { pk: 'string' },
  primaryIndex: { hashKey: 'pk' },
});
```

- [ ] **Step 2: Add Function + Api**

```typescript
const askClara = new sst.aws.Function('AskClara', {
  handler: 'packages/ask-clara/handler.handler',
  link: [usage],
  environment: {
    ASK_CLARA_MONTHLY_BUDGET_USD: '5',
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
  },
  permissions: [{ actions: ['bedrock:InvokeModel'], resources: ['*'] }],
});

const api = new sst.aws.ApiGatewayV2('Api');
api.route('POST /api/ask', askClara.arn);
```

- [ ] **Step 3: Link StaticSite to API**

Pass API URL to frontend via env `VITE_ASK_CLARA_API_URL` at build, or same-origin if using CloudFront routing (configure per SST pattern).

- [ ] **Step 4: Configure CORS** on API route — allow site domain only.

- [ ] **Step 5: Configure rate limiting** on API Gateway stage: 10 req/min/IP.

- [ ] **Step 6: Deploy to dev stage**

Run: `npx sst deploy`
Expected: outputs site URL + api URL

---

### Task 9: Ask Clara chat UI

**Files:**
- Modify: `src/components/SearchBar.tsx` → rename or wrap as `AskClaraChat.tsx`
- Modify: `src/sections/AskClara.tsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Consumes: `POST /api/ask`, canned responses from `site.search.responses`

- [ ] **Step 1: Upgrade to chat message list**

State: `messages: { role: 'user' | 'clara'; text: string }[]`

- [ ] **Step 2: Chip click — local first**

If `site.search.responses[suggestion]` exists → append without API call.

- [ ] **Step 3: API call on submit**

```typescript
const res = await fetch(`${import.meta.env.VITE_ASK_CLARA_API_URL}/api/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: query, history: messages.slice(-4) }),
});
const { answer, refused } = await res.json();
```

- [ ] **Step 4: Loading + error states**

"Clara is thinking…" spinner; network error → fallback message from `site.search.fallback`.

- [ ] **Step 5: Refused styling**

`.search-bar__answer--refused` — muted, still on-brand.

- [ ] **Step 6: Verify end-to-end on deployed site**

---

### Task 10: Sheets template and staff docs

**Files:**
- Create: `docs/sheets-setup.md` (expand)
- Create: `docs/sheets-template/README.md` with column headers per tab

- [ ] **Step 1: Document workbook structure** matching spec §3 exactly.

- [ ] **Step 2: Document publish workflow** (manual for demo: `npm run sync:content && npm run deploy`).

- [ ] **Step 3: Document AWS setup** — Bedrock model access, service account, env vars.

---

### Task 11: Final deploy and demo checklist

- [ ] **Step 1: Populate Sheet** with placeholder content (or keep JSON until client data arrives).

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Deploy**

Run: `npm run deploy`
Expected: SST outputs production URL

- [ ] **Step 4: Update `seo_site_url`** in Sheet/JSON to deployed URL; redeploy.

- [ ] **Step 5: Run full testing checklist** from spec §11.

---

## Spec Coverage Self-Review

| Spec section | Task |
|--------------|------|
| §3 Sheets model | Task 5, 10 |
| §4 Sync script | Task 5 |
| §5 Events list + explorer | Tasks 1–4 |
| §6 Ask Clara Bedrock | Tasks 6–7, 9 |
| §7 $5 budget | Task 7, 8 |
| §8 Gating layers | Task 7 |
| §9 Deploy | Tasks 8, 11 |
| §11 Testing | Task 11 |

No TBD placeholders remain. Calendar Explorer included in v1 (Task 4).

---

## Execution Order

```
Task 1 → 2 → 3 → 4 (events complete)
Task 5 → 6 (content pipeline)
Task 7 → 8 → 9 (Ask Clara — can parallel after Task 6)
Task 10 → 11 (docs + deploy)
```

Tasks 1–4 can ship and demo events before Ask Clara is ready.

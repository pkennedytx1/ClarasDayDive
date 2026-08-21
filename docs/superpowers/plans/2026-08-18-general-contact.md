# General Contact Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secured general contact form (info@) with Turnstile and event-matching modal UX, separate from the unchanged Plan an event flow.

**Architecture:** New `ContactUs` homepage section + `GeneralContactModal` on the frontend; new `packages/general-contact` Lambda on `POST /api/general-contact` with the same anti-abuse stack as event booking; `_Settings` keys drive copy and email routing via sync → `general-contact-config.json`.

**Tech Stack:** React 18, Vite, SST v4, API Gateway HTTP API, Lambda Node 24, SES, DynamoDB, Cloudflare Turnstile, Google Sheets sync.

## Global Constraints

- Do **not** modify event booking modal steps, fields, API payload, or email routing.
- Reuse `.booking-modal` CSS and mobile bottom-sheet drag behavior from `EventBookingModal`.
- Turnstile: `execution: 'execute'` on verify phase; requires `TURNSTILE_SECRET_KEY` (Lambda) and `VITE_TURNSTILE_SITE_KEY` (static build).
- Success auto-close: **4000ms**; Turnstile fail auto-close: **2500ms**.
- General emails From: `info@clarasdaydive.com` (configurable via `general_inquiry_from`).
- Rate limits: IP 5/10min, email 2/hour with `CONTACT#` DynamoDB key prefix.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `docs/superpowers/specs/2026-08-18-general-contact-design.md` | exists | Approved spec |
| `docs/sheets-template/csv/_Settings.csv` | modify | New settings keys |
| `scripts/sync-from-sheets.mjs` | modify | Sync config + nav default |
| `packages/general-contact/*` | create | Lambda handler, validation, emails |
| `sst.config.ts` | modify | Lambda + route |
| `src/context/GeneralContactContext.tsx` | create | Modal open/close state |
| `src/components/GeneralContactModal.tsx` | create | Form modal UI |
| `src/sections/ContactUs.tsx` | create | Homepage section |
| `src/sections/Contact.tsx` | modify | Remove generic events mailto |
| `src/lib/general-contact-api.ts` | create | Fetch POST client |
| `src/lib/general-contact-validation.ts` | create | Client validation |
| `src/lib/sections.ts` | modify | `/contact-us` route |
| `src/lib/content.ts` | modify | Nav link insertion |
| `src/pages/HomePage.tsx` | modify | Section + provider + modal |
| `src/App.tsx` | modify | Wrap provider |
| `src/content/site.json` | modify | Section copy + nav (via sync) |
| `src/styles/components.css` | modify | Only if minor contact-us tweaks needed |

---

### Task 1: Sheet keys + sync config

**Files:**
- Modify: `docs/sheets-template/csv/_Settings.csv`
- Modify: `scripts/sync-from-sheets.mjs`
- Modify: `docs/sheets-template/README.md`
- Modify: `docs/sheets-publish/CHECKLIST.md`

**Interfaces:**
- Produces: `packages/general-contact/general-contact-config.json` shape:
  ```json
  {
    "staffEmail": "string",
    "fromEmail": "info@clarasdaydive.com",
    "siteName": "Clara's Day Dive",
    "siteUrl": "https://www.clarasdaydive.com",
    "responseTime": "We typically reply within a day."
  }
  ```
- Produces: `site.json` fields:
  ```json
  {
    "generalContact": {
      "email": "info@clarasdaydive.com",
      "responseTime": "..."
    },
    "sections": {
      "contactUs": {
        "eyebrow": "Get in touch",
        "title": "Contact us",
        "lead": "...",
        "button": "Send message"
      }
    }
  }
  ```

- [ ] **Step 1:** Add rows to `_Settings.csv`:
  ```
  general_inquiry_email,<staff inbox>
  general_inquiry_from,info@clarasdaydive.com
  contact_us_eyebrow,Get in touch
  contact_us_title,Contact us
  contact_us_lead,"Questions about hours, directions, or anything else — we're happy to help."
  contact_us_button,Send message
  ```

- [ ] **Step 2:** In `sync-from-sheets.mjs`:
  - Add keys to `OPTIONAL_SETTINGS_KEYS`
  - Add `writeGeneralContactConfig(settings)` (mirror `writeInquiryConfig`)
  - Extend `buildSiteJson` with `generalContact` + `sections.contactUs`
  - Update `DEFAULT_NAV.links` to insert `{ label: 'Contact us', href: '/contact-us' }` before Plan an event

- [ ] **Step 3:** Update README + CHECKLIST with new keys and SES note for `info@`

- [ ] **Step 4:** Run `node scripts/sync-from-sheets.mjs` with local CSV fallback OR verify `site.json` structure manually if no sheet creds

- [ ] **Step 5:** Verify `npx tsc --noEmit` passes after `site.json` shape change

---

### Task 2: Backend package — general-contact Lambda

**Files:**
- Create: `packages/general-contact/types.ts`
- Create: `packages/general-contact/validate.ts`
- Create: `packages/general-contact/security.ts` (copy from event-booking)
- Create: `packages/general-contact/rate-limit.ts` (copy from event-booking)
- Create: `packages/general-contact/turnstile.ts` (copy from event-booking)
- Create: `packages/general-contact/email-templates.ts`
- Create: `packages/general-contact/handler.ts`
- Create: `packages/general-contact/general-contact-config.json`
- Create: `packages/general-contact/tsconfig.json`
- Modify: `packages/general-contact/handler.ts` — import `sendBrandedEmail` from `../event-booking/email-send.js`

**Interfaces:**
- Produces handler export: `handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>`
- Produces `validateContact(body): { ok: true, data: GeneralContactPayload } | { ok: false, error: string }`
- Payload type:
  ```typescript
  type GeneralContactPayload = {
    name: string;
    email: string;
    message: string;
  };
  ```

- [ ] **Step 1:** Create `types.ts` and `validate.ts` — name 2–100, email regex, message 10–2000

- [ ] **Step 2:** Copy `security.ts`, `rate-limit.ts`, `turnstile.ts` from event-booking (identical)

- [ ] **Step 3:** Create `email-templates.ts`:
  - `staffGeneralContactEmail(data, config)` — subject `General inquiry — {name}`
  - `guestGeneralReceiptEmail(data, config)` — subject `We received your message — {siteName}`
  - Reuse `shell()` pattern from event templates (import or duplicate minimal shell)

- [ ] **Step 4:** Create `handler.ts`:
  - Same middleware order: size → honeypot → timing → IP limit → turnstile → validate → email limit → SES
  - Dynamo keys: `CONTACT#IP#…`, `CONTACT#EMAIL#…`
  - Load config from `general-contact-config.json`

- [ ] **Step 5:** Add seed `general-contact-config.json` with defaults

- [ ] **Step 6:** Run `npx tsc --noEmit -p packages/general-contact/tsconfig.json`

---

### Task 3: SST wiring

**Files:**
- Modify: `sst.config.ts`

- [ ] **Step 1:** Add `GeneralContact` function:
  ```typescript
  const generalContact = new sst.aws.Function('GeneralContact', {
    handler: 'packages/general-contact/handler.handler',
    runtime: 'nodejs24.x',
    link: [usage],
    copyFiles: [{
      from: 'packages/event-booking/assets/wordmark-color.png',
      to: 'assets/wordmark-color.png',
    }],
    environment: {
      GENERAL_CONTACT_USAGE_TABLE: usage.name,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
    },
    permissions: [
      { actions: ['ses:SendEmail', 'ses:SendRawEmail'], resources: ['*'] },
    ],
  });
  api.route('POST /api/general-contact', generalContact.arn);
  ```

- [ ] **Step 2:** Add to StaticSite env: `VITE_GENERAL_CONTACT_API_URL: api.url`

- [ ] **Step 3:** Update handler to read `GENERAL_CONTACT_USAGE_TABLE` env var

---

### Task 4: Frontend API + validation

**Files:**
- Create: `src/lib/general-contact-api.ts`
- Create: `src/lib/general-contact-validation.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type GeneralContactForm = { name: string; email: string; message: string };
  export const EMPTY_GENERAL_CONTACT: GeneralContactForm;
  export async function submitGeneralContact(payload: GeneralContactForm & {
    turnstileToken?: string;
    openedAt: number;
    website: string;
  }): Promise<{ ok: true } | { ok: false; error: string }>;
  ```
- Consumes: `import.meta.env.VITE_GENERAL_CONTACT_API_URL`

- [ ] **Step 1:** Create validation mirroring server rules

- [ ] **Step 2:** Create API client (copy pattern from `event-booking-api.ts`, endpoint `/api/general-contact`)

- [ ] **Step 3:** `npx tsc --noEmit`

---

### Task 5: GeneralContactModal

**Files:**
- Create: `src/components/GeneralContactModal.tsx`
- Create: `src/context/GeneralContactContext.tsx`

**Interfaces:**
- Produces: `GeneralContactProvider`, `useGeneralContact()` with `{ open, openContact, closeContact }`
- Modal props: `{ open: boolean; onClose: () => void }`

- [ ] **Step 1:** Create context (mirror `EventBookingContext.tsx`)

- [ ] **Step 2:** Create modal — copy from `EventBookingModal.tsx`:
  - Keep: overlay, sheet, drag handle, `isPresent`/`isClosing`, focus trap, escape
  - Single form with name, email, message (textarea), honeypot
  - Phases: `form | verify | sending | success`
  - Turnstile on verify screen via `TurnstileField` ref execute
  - Submit calls `submitGeneralContact`

- [ ] **Step 3:** Success copy: “Thanks, {firstName}! We received your message and sent a confirmation to {email}.”

- [ ] **Step 4:** `npx tsc --noEmit`

---

### Task 6: ContactUs section + routing

**Files:**
- Create: `src/sections/ContactUs.tsx`
- Modify: `src/sections/Contact.tsx`
- Modify: `src/lib/sections.ts`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/content.ts` (if nav helper needs update)

- [ ] **Step 1:** Add `/contact-us` to `HOME_ROUTE_PATHS`, `SITEMAP_SECTION_PATHS`, `LEGACY_HASH_TO_PATH`, `pathToSectionId` valid list

- [ ] **Step 2:** Create `ContactUs.tsx`:
  - Two-column layout matching contact section tone (or simpler single column)
  - CTA opens `openContact()`
  - Secondary `mailto:{site.generalContact.email}` link

- [ ] **Step 3:** Update `Contact.tsx` — remove `mailto:events@` from event card; optional note “For private events only”

- [ ] **Step 4:** Wire in `HomePage.tsx`:
  - Import `ContactUs` (place before `Contact` section)
  - Wrap app with `GeneralContactProvider` in `App.tsx`
  - Render `<GeneralContactModal open={...} onClose={...} />`

- [ ] **Step 5:** Update `getHomeSectionIds()` to include `#contact-us`

- [ ] **Step 6:** Manual check: navigate to `/contact-us`, CTA opens modal, mobile drag works

---

### Task 7: Test script + verification

**Files:**
- Create: `scripts/test-general-contact-email.mjs` (optional, mirror event test)
- Modify: `package.json` — `"test:general-email": "tsx scripts/test-general-contact-email.ts"`

- [ ] **Step 1:** Add local test script sending sample general contact emails via SES

- [ ] **Step 2:** Run `npm run build` locally

- [ ] **Step 3:** Manual test checklist (from spec section 9)

- [ ] **Step 4:** Confirm event form still works (`npm run test:email` if available)

---

## Spec Coverage Check

| Spec requirement | Task |
|------------------|------|
| Separate info@ routing | Task 1, 2 |
| Event flow unchanged | Task 6 (Contact.tsx only removes mailto) |
| Turnstile + rate limits | Task 2, 5 |
| Modal styling + mobile sheet | Task 5 |
| Nav Contact us | Task 1, 6 |
| Sheet-driven copy | Task 1 |
| Branded emails | Task 2 |
| SES info@ | Task 7 (ops note) |

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-18-general-contact.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — implement tasks in this session with checkpoints

Which approach do you want?

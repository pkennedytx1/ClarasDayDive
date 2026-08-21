# General Contact — Design Spec

**Date:** 2026-08-18  
**Status:** Approved — pending spec review  
**Goal:** Add a separate, secure “Contact us” path for general inquiries to `info@clarasdaydive.com`, without changing the existing Plan an event booking flow.

---

## 1. Problem

General questions (hours, directions, press, lost & found, etc.) are reaching the **events coordinator** because the site only exposes `events@` on the contact section and routes structured inquiries through the event booking form.

The client has set up **`info@clarasdaydive.com`** and wants general and event inquiries separated.

---

## 2. Decision Summary

| Choice | Decision |
|--------|----------|
| UX pattern | **Option B** — lightweight secured form (not mailto-primary) |
| Modal | Match event booking modal styling + mobile bottom-sheet drag-to-dismiss |
| Bot protection | Cloudflare Turnstile (same widget, verify-on-submit flow) |
| Event flow | **Unchanged** — same modal, fields, API, and emails |
| Nav | New **Contact us** item; **Plan an event** stays on `/contact` |

---

## 3. Information Architecture

### Nav (after change)

| Label | Route | Section id | Action |
|-------|-------|------------|--------|
| Drinks | `/drinks` | `#drinks` | scroll |
| What's Here | `/here` | `#here` | scroll |
| Gallery | `/gallery` | `#gallery` | scroll (when photos exist) |
| Events | `/events` | `#events` | scroll |
| FAQ | `/faq` | `#faq` | scroll |
| **Contact us** | `/contact-us` | `#contact-us` | scroll + open form CTA |
| Plan an event | `/contact` | `#contact` | scroll (event booking CTA) |

Insert **Contact us** before **Plan an event** in nav order.

### Page layout

New homepage section **`ContactUs`** at `#contact-us`:

- Eyebrow, title, lead — from `_Settings`
- Primary CTA button → opens **General Contact modal**
- Secondary text link: `mailto:info@…` as fallback (“Or email us directly”)

Existing **`Contact`** section (`#contact`) remains event-only:

- Remove the `mailto:events@` link from the event card (or replace with copy: “Event inquiries only — use the form above”)
- Keep event booking button and response-time note

---

## 4. General Contact Modal (Frontend)

### Visual / interaction

Reuse existing booking modal patterns:

- CSS: `.booking-modal`, `.booking-modal__sheet`, drag handle, overlay, step transitions
- Desktop: centered dialog
- Mobile: bottom sheet, swipe-down to close (same drag logic as `EventBookingModal`)
- Close animation: `isPresent` / `isClosing` + `requestClose()` calling `onClose()` immediately
- Focus trap, escape key, body scroll lock (same hooks/behavior)

### Flow (phases)

Single form screen — **no multi-step wizard** (unlike events):

```
form  →  verify (Turnstile execute)  →  sending  →  success  →  auto-close (4s)
```

On Turnstile failure: error message → auto-close ~2.5s (match events).

On API failure: return to form with error banner.

### Fields

| Field | Required | Validation |
|-------|----------|------------|
| Name | Yes | 2–100 chars |
| Email | Yes | Valid email, max 254 |
| Message | Yes | 10–2000 chars |

No phone, date, guest count, or company fields.

Hidden anti-abuse (same as events):

- Honeypot `website`
- `openedAt` timestamp

### Components (new)

| File | Responsibility |
|------|----------------|
| `src/context/GeneralContactContext.tsx` | `openContact` / `closeContact` |
| `src/components/GeneralContactModal.tsx` | Modal UI + submit flow |
| `src/sections/ContactUs.tsx` | Section copy + CTA |
| `src/lib/general-contact-api.ts` | POST client |
| `src/lib/general-contact-validation.ts` | Client validation |

---

## 5. Backend API

### Route

`POST /api/general-contact` on existing API Gateway (same origin/CORS as event inquiry).

### Package

New Lambda package: `packages/general-contact/`

Mirrors `packages/event-booking/` structure:

| File | Purpose |
|------|---------|
| `handler.ts` | Request handling |
| `validate.ts` | Payload validation |
| `security.ts` | Honeypot, timing, payload size, IP helper |
| `rate-limit.ts` | DynamoDB rate limits (can import copy from event-booking or share table) |
| `turnstile.ts` | Cloudflare verify (same env `TURNSTILE_SECRET_KEY`) |
| `email-templates.ts` | Staff + guest receipt HTML/text |
| `email-send.ts` | Reuse branded send via CID logo (import from event-booking or duplicate) |
| `general-contact-config.json` | Server-only routing (synced from sheet) |
| `types.ts` | Payload + config types |

### Rate limits (same philosophy as events)

| Key | Limit | Window |
|-----|-------|--------|
| IP | 5 | 10 minutes |
| Email | 2 | 1 hour |

Uses same DynamoDB usage table with distinct key prefix: `CONTACT#IP#…`, `CONTACT#EMAIL#…`.

### Emails

| Email | From | To | Reply-To |
|-------|------|-----|----------|
| Staff notification | `info@clarasdaydive.com` | `general_inquiry_email` (sheet) | Guest email |
| Guest receipt | `info@clarasdaydive.com` | Guest email | `info@clarasdaydive.com` |

Branded templates (same shell as event emails — wordmark, cream nav bg, rose header).

Staff subject example: `General inquiry — {name}`  
Guest subject example: `We received your message — Clara's Day Dive`

### SES prerequisite

`info@clarasdaydive.com` must be verified in SES (domain already verified — alias receiving is separate GoDaddy setup).

---

## 6. Sheet Configuration (`_Settings`)

New keys:

| key | purpose | example |
|-----|---------|---------|
| `general_inquiry_email` | Staff inbox for general form | alias inbox for info@ |
| `general_inquiry_from` | From address on general emails | `info@clarasdaydive.com` |
| `contact_us_eyebrow` | Section eyebrow | `Get in touch` |
| `contact_us_title` | Section heading | `Contact us` |
| `contact_us_lead` | Section intro | General questions welcome… |
| `contact_us_button` | Modal CTA / submit label | `Send message` |

Sync writes `packages/general-contact/general-contact-config.json` (server-only, not in public bundle).

Optional keys fall back to sensible defaults if blank.

**Existing keys unchanged:**

- `contact_email` — still `events@` for display in event context / Ask Clara knowledge
- `events_inquiry_*` — event form routing

---

## 7. Wiring & Deploy

### `sst.config.ts`

- New `GeneralContact` Lambda function
- Route `POST /api/general-contact`
- Same permissions: SES, DynamoDB usage table, Turnstile env
- `copyFiles` for logo asset (if using shared email-send)

### Build env

`VITE_GENERAL_CONTACT_API_URL` — same API base URL as event booking (set in StaticSite env alongside existing vars).

### Sync

`scripts/sync-from-sheets.mjs`:

- Add settings keys to optional list
- `writeGeneralContactConfig(settings)` on publish

### Docs

Update `docs/sheets-template/csv/_Settings.csv`, `docs/sheets-template/README.md`, `docs/sheets-publish/CHECKLIST.md`.

---

## 8. Out of Scope (v1)

- Category/topic dropdown for general inquiries
- Shared abstract modal component refactor (copy pattern, reuse CSS)
- Ask Clara routing changes (can mention info@ in knowledge follow-up)
- Auto-reply customization per inquiry type
- CRM / ticketing integration

---

## 9. Testing

### Manual

- [ ] Submit general form → staff email to `general_inquiry_email`, guest receipt to submitter
- [ ] Event form still routes to `events_inquiry_email` / `events@` — unchanged
- [ ] Turnstile blocks bots when secret key set
- [ ] Mobile sheet drag-to-dismiss works
- [ ] Rate limits return 429 after repeated submits
- [ ] Honeypot filled → 400
- [ ] Nav scrolls to `#contact-us` from `/contact-us` route

### Sheet

- [ ] Change `general_inquiry_email` in `_Settings` → publish → verify new inbox receives mail

---

## 10. Success Criteria

1. General inquiries submit through secured form and land in `info@` staff inbox (via configured alias).
2. Event inquiries continue through existing flow unchanged.
3. Modal look, motion, and Turnstile behavior match event booking.
4. All copy and routing configurable via `_Settings` without code changes.

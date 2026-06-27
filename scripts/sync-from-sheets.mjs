import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { writeKnowledge } from './generate-knowledge.mjs';
import { fetchCalendarEvents, normalizeCalendarId } from './lib/google-calendar-events.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src/content');

const TABS = ['_Settings', 'Hours', 'Drinks', 'Events', 'WhatsHere', 'FAQ', 'AskClara'];

const DEFAULT_NAV = {
  links: [
    { label: 'Drinks', href: '#drinks' },
    { label: "What's Here", href: '#here' },
    { label: 'Events', href: '#events' },
    { label: 'Visit', href: '#contact' },
  ],
  ctaLabel: 'Book the bar',
  ctaHref: '#contact',
};

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DAY_ABBR = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readExistingSite() {
  const path = join(contentDir, 'site.json');
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizeHeader(header) {
  return String(header ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function parseRows(values) {
  if (!values?.length) return [];
  const headers = values[0].map(normalizeHeader);
  return values.slice(1).map((row, index) => {
    const obj = { _row: index + 2 };
    headers.forEach((key, i) => {
      obj[key] = row[i] ?? '';
    });
    return obj;
  });
}

function isActive(row) {
  const val = String(row.active ?? 'TRUE').trim().toUpperCase();
  return val !== 'FALSE' && val !== '0' && val !== 'NO';
}

function requireField(errors, tab, row, field, value) {
  if (String(value ?? '').trim() === '') {
    errors.push(`${tab} row ${row._row}: "${field}" is required`);
    return false;
  }
  return true;
}

function parseNumericPrice(raw) {
  const cleaned = String(raw).replace(/[$,\s]/g, '');
  if (cleaned === '' || Number.isNaN(Number(cleaned))) return null;
  return Number(cleaned);
}

function formatPrice(num) {
  const n = Number(num);
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2).replace(/\.?0+$/, '')}`;
}

function parseDayGroup(dayGroup) {
  const raw = String(dayGroup).trim();
  if (!raw) return [];

  const rangeMatch = raw.match(/^(\w+)\s*[–—-]\s*(\w+)$/i);
  if (rangeMatch) {
    const startIdx = DAY_NAMES.findIndex(
      (d) => d.toLowerCase().startsWith(rangeMatch[1].toLowerCase().slice(0, 3)),
    );
    const endIdx = DAY_NAMES.findIndex(
      (d) => d.toLowerCase().startsWith(rangeMatch[2].toLowerCase().slice(0, 3)),
    );
    if (startIdx >= 0 && endIdx >= 0) {
      const days = [];
      for (let i = startIdx; ; i = (i + 1) % 7) {
        days.push(DAY_NAMES[i]);
        if (i === endIdx) break;
      }
      return days;
    }
  }

  return raw
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (DAY_ABBR[lower.slice(0, 4)] ?? DAY_ABBR[lower.slice(0, 3)]) {
        return DAY_ABBR[lower.slice(0, 4)] ?? DAY_ABBR[lower.slice(0, 3)];
      }
      const match = DAY_NAMES.find((d) => d.toLowerCase() === lower || d.toLowerCase().startsWith(lower.slice(0, 3)));
      return match ?? part;
    });
}

function parseChicagoDatetime(str) {
  const m = String(str).trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error(`Invalid datetime "${str}" — expected YYYY-MM-DD HH:MM`);

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const pad = (n) => String(n).padStart(2, '0');
  const localIso = `${m[1]}-${m[2]}-${m[3]}T${pad(hour)}:${pad(minute)}:00`;

  let ts = Date.UTC(year, month - 1, day, hour + 6, minute);

  for (let attempt = 0; attempt < 6; attempt++) {
    const d = new Date(ts);
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      })
        .formatToParts(d)
        .filter((p) => p.type !== 'literal')
        .map((p) => [p.type, Number(p.value)]),
    );

    const ch = parts.hour === 24 ? 0 : parts.hour;

    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      ch === hour &&
      parts.minute === minute
    ) {
      const offsetMin = getChicagoOffsetMinutes(d);
      const sign = offsetMin <= 0 ? '-' : '+';
      const absMin = Math.abs(offsetMin);
      const oh = pad(Math.floor(absMin / 60));
      const om = pad(absMin % 60);
      return `${localIso}${sign}${oh}:${om}`;
    }

    const diffMin = hour * 60 + minute - (ch * 60 + parts.minute);
    const diffDay = (day - parts.day) * 24 * 60;
    ts += (diffMin + diffDay) * 60 * 1000;
  }

  throw new Error(`Could not resolve America/Chicago time for "${str}"`);
}

function getChicagoOffsetMinutes(date) {
  const chi = new Date(date.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  return (chi - utc) / 60000;
}

function deriveMonthDay(iso) {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'America/Chicago' }).toUpperCase();
  const day = d.toLocaleString('en-US', { day: '2-digit', timeZone: 'America/Chicago' });
  return { month, day };
}

function normalizeSheetId(input) {
  const raw = String(input).trim().replace(/\\[?#].*$/, '');
  const fromUrl = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl) return fromUrl[1];
  return raw;
}

function loadServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required when GOOGLE_SHEET_ID is set');
  }

  if (raw.trim().startsWith('{')) {
    return JSON.parse(raw);
  }

  const path = raw.startsWith('/') ? raw : join(root, raw);
  return JSON.parse(readFileSync(path, 'utf8'));
}

async function fetchSheetTabs(sheetId, credentials) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const tabData = {};

  for (const tab of TABS) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tab}'`,
    });
    tabData[tab] = parseRows(res.data.values ?? []);
  }

  return tabData;
}

function buildSettingsMap(rows, errors) {
  const map = {};
  for (const row of rows) {
    if (!requireField(errors, '_Settings', row, 'key', row.key)) continue;
    if (!requireField(errors, '_Settings', row, 'value', row.value)) continue;
    map[row.key.trim()] = String(row.value).trim();
  }
  return map;
}

function buildSiteJson(settings, hoursRows, askClaraRows, errors) {
  const existing = readExistingSite();

  const email = settings.contact_email ?? '';
  if (email && !EMAIL_RE.test(email)) {
    errors.push(`_Settings: contact_email "${email}" is not a valid email`);
  }

  const activeAsk = askClaraRows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  for (const row of activeAsk) {
    requireField(errors, 'AskClara', row, 'suggestion', row.suggestion);
    requireField(errors, 'AskClara', row, 'response', row.response);
  }

  const suggestions = activeAsk.map((r) => String(r.suggestion).trim());
  const responses = Object.fromEntries(
    activeAsk.map((r) => [String(r.suggestion).trim(), String(r.response).trim()]),
  );

  const activeHours = hoursRows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const hours = [];
  const hoursStructured = [];

  for (const row of activeHours) {
    requireField(errors, 'Hours', row, 'day_group', row.day_group);
    requireField(errors, 'Hours', row, 'display_label', row.display_label);
    requireField(errors, 'Hours', row, 'opens', row.opens);
    requireField(errors, 'Hours', row, 'closes', row.closes);

    const days = parseDayGroup(row.day_group);
    if (!days.length) {
      errors.push(`Hours row ${row._row}: could not parse day_group "${row.day_group}"`);
    }

    hours.push(String(row.display_label).trim());
    hoursStructured.push({
      days,
      opens: String(row.opens).trim(),
      closes: String(row.closes).trim(),
    });
  }

  return {
    name: settings.site_name ?? existing.name ?? "Clara's Day Dive",
    tagline: settings.tagline ?? existing.tagline ?? '',
    description: settings.description ?? existing.description ?? '',
    hero: {
      meta: settings.hero_meta ?? existing.hero?.meta ?? '',
    },
    seo: {
      siteUrl: settings.seo_site_url ?? existing.seo?.siteUrl ?? '',
      title: settings.seo_title ?? existing.seo?.title ?? '',
      description: settings.seo_description ?? existing.seo?.description ?? '',
      longDescription: existing.seo?.longDescription ?? '',
      keywords: existing.seo?.keywords ?? [],
      geo: existing.seo?.geo ?? { latitude: 30.2588, longitude: -97.7264 },
      priceRange: existing.seo?.priceRange ?? '$$',
    },
    location: {
      eyebrow: settings.location_eyebrow ?? existing.location?.eyebrow ?? '',
      address: settings.address ?? existing.location?.address ?? '',
      city: settings.city ?? existing.location?.city ?? '',
      region: settings.region ?? existing.location?.region ?? 'TX',
      postalCode: settings.postal_code ?? existing.location?.postalCode ?? '',
      country: settings.country ?? existing.location?.country ?? 'US',
    },
    hours,
    hoursStructured,
    social: {
      instagram: settings.instagram_url ?? existing.social?.instagram ?? '',
    },
    contact: {
      coordinatorName: settings.contact_name ?? existing.contact?.coordinatorName ?? '',
      coordinatorRole: settings.contact_role ?? existing.contact?.coordinatorRole ?? '',
      email,
      phone: settings.contact_phone ?? existing.contact?.phone ?? '',
      responseTime: settings.contact_response_time ?? existing.contact?.responseTime ?? '',
    },
    search: {
      sectionEyebrow: settings.ask_clara_eyebrow ?? existing.search?.sectionEyebrow ?? 'Ask Clara',
      sectionTitle: settings.ask_clara_title ?? existing.search?.sectionTitle ?? '',
      placeholder: settings.ask_clara_placeholder ?? existing.search?.placeholder ?? '',
      buttonLabel: settings.ask_clara_button ?? existing.search?.buttonLabel ?? 'Dive in',
      suggestions,
      responses,
      fallback:
        settings.ask_clara_fallback ??
        existing.search?.fallback ??
        "Clara says: come on in — we'll pour you something good.",
    },
    nav: existing.nav ?? DEFAULT_NAV,
  };
}

function buildDrinksJson(rows, errors) {
  const active = rows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const items = [];
  const categories = new Set();

  for (const row of active) {
    requireField(errors, 'Drinks', row, 'name', row.name);
    requireField(errors, 'Drinks', row, 'category', row.category);
    requireField(errors, 'Drinks', row, 'price', row.price);
    requireField(errors, 'Drinks', row, 'description', row.description);

    const priceNum = parseNumericPrice(row.price);
    if (priceNum === null) {
      errors.push(`Drinks row ${row._row}: price "${row.price}" must be numeric`);
      continue;
    }

    const cat = String(row.category).trim();
    categories.add(cat);

    const item = {
      cat,
      name: String(row.name).trim(),
      price: formatPrice(priceNum),
      desc: String(row.description).trim(),
    };

    const badge = String(row.badge ?? '').trim();
    if (badge) item.badge = badge;

    items.push(item);
  }

  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));
  return {
    categories: ['All', ...sortedCategories],
    items,
  };
}

function buildEventsJson(rows, settings, errors) {
  const active = rows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const items = [];

  for (const row of active) {
    requireField(errors, 'Events', row, 'title', row.title);
    requireField(errors, 'Events', row, 'start_datetime', row.start_datetime);
    requireField(errors, 'Events', row, 'end_datetime', row.end_datetime);
    requireField(errors, 'Events', row, 'tag', row.tag);
    requireField(errors, 'Events', row, 'description', row.description);

    let start;
    let end;
    try {
      start = parseChicagoDatetime(row.start_datetime);
      end = parseChicagoDatetime(row.end_datetime);
    } catch (err) {
      errors.push(`Events row ${row._row}: ${err.message}`);
      continue;
    }

    if (new Date(end) <= new Date(start)) {
      errors.push(`Events row ${row._row}: end_datetime must be after start_datetime`);
      continue;
    }

    const { month, day } = deriveMonthDay(start);
    const item = {
      start,
      end,
      month,
      day,
      tag: String(row.tag).trim(),
      title: String(row.title).trim(),
      timeLabel: String(row.time_label ?? row.timeLabel ?? '').trim(),
      desc: String(row.description).trim(),
    };

    const ticketUrl = String(row.ticket_url ?? row.ticketUrl ?? '').trim();
    if (ticketUrl) item.ticketUrl = ticketUrl;

    items.push(item);
  }

  return {
    items,
    hostNote:
      settings.events_host_note ??
      "Want to host something on our patio? Reach out below — we'd love to hear your idea.",
  };
}

async function buildEvents(settings, eventRows, credentials, errors) {
  const calendarId = normalizeCalendarId(
    settings.google_calendar_id || process.env.GOOGLE_CALENDAR_ID || '',
  );
  const source = String(settings.events_source || (calendarId ? 'calendar' : 'sheet'))
    .trim()
    .toLowerCase();

  if (source !== 'sheet' && source !== 'calendar' && source !== 'both') {
    errors.push(`_Settings events_source must be sheet, calendar, or both (got "${source}")`);
    return buildEventsJson(eventRows, settings, errors);
  }

  if ((source === 'calendar' || source === 'both') && !calendarId) {
    errors.push(
      'events_source includes Google Calendar but google_calendar_id (or GOOGLE_CALENDAR_ID) is not set',
    );
  }

  const hostNote =
    settings.events_host_note ??
    "Want to host something on our patio? Reach out below — we'd love to hear your idea.";

  let items = [];

  if (source === 'sheet' || source === 'both') {
    items = items.concat(buildEventsJson(eventRows, settings, errors).items);
  }

  if ((source === 'calendar' || source === 'both') && calendarId) {
    const calendarItems = await fetchCalendarEvents(credentials, calendarId, errors);
    items = items.concat(calendarItems);
  }

  items.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return { items, hostNote };
}

function buildWhatsHereJson(rows, errors) {
  const validIcons = new Set(['truck', 'food-truck', 'coffee', 'sun']);
  const active = rows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const items = [];

  active.forEach((row, index) => {
    requireField(errors, 'WhatsHere', row, 'title', row.title);
    requireField(errors, 'WhatsHere', row, 'tag', row.tag);
    requireField(errors, 'WhatsHere', row, 'body', row.body);
    requireField(errors, 'WhatsHere', row, 'icon', row.icon);

    const icon = String(row.icon).trim().toLowerCase();
    if (!validIcons.has(icon)) {
      errors.push(`WhatsHere row ${row._row}: icon "${row.icon}" must be food-truck, truck, coffee, or sun`);
    }

    const item = {
      icon: icon === 'truck' ? 'food-truck' : icon,
      tone: index === 0 ? 'cream' : 'white',
      tag: String(row.tag).trim(),
      title: String(row.title).trim(),
      body: String(row.body).trim(),
    };

    if (row.hours?.toString().trim()) {
      item.hours = String(row.hours).trim();
    }
    if (row.website_url?.toString().trim()) {
      item.websiteUrl = String(row.website_url).trim();
    }
    if (row.order_url?.toString().trim()) {
      item.orderUrl = String(row.order_url).trim();
    }

    items.push(item);
  });

  return { items };
}

function buildFaqJson(rows, errors) {
  const active = rows.filter(isActive).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const items = [];

  for (const row of active) {
    requireField(errors, 'FAQ', row, 'question', row.question);
    requireField(errors, 'FAQ', row, 'answer', row.answer);

    items.push({
      question: String(row.question).trim(),
      answer: String(row.answer).trim(),
    });
  }

  return { items };
}

function writeJson(name, data) {
  writeFileSync(join(contentDir, name), `${JSON.stringify(data, null, 2)}\n`);
}

function reportErrors(errors) {
  console.error('\nSync validation failed:\n');
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  console.error(`\n${errors.length} error(s) — fix the sheet and re-run sync.\n`);
}

async function syncFromSheets() {
  const sheetId = process.env.GOOGLE_SHEET_ID
    ? normalizeSheetId(process.env.GOOGLE_SHEET_ID)
    : '';
  if (!sheetId) {
    console.log('GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON');
    const knowledge = writeKnowledge();
    console.log(`Generated src/content/knowledge.json (${knowledge.chunks.length} chunks)`);
    return;
  }

  console.log(`Syncing from Google Sheet ${sheetId}…`);

  const credentials = loadServiceAccountCredentials();
  const tabs = await fetchSheetTabs(sheetId, credentials);
  const errors = [];

  const settings = buildSettingsMap(tabs._Settings, errors);
  const site = buildSiteJson(settings, tabs.Hours, tabs.AskClara, errors);
  const drinks = buildDrinksJson(tabs.Drinks, errors);
  const events = await buildEvents(settings, tabs.Events, credentials, errors);
  const whatsHere = buildWhatsHereJson(tabs.WhatsHere, errors);
  const faq = buildFaqJson(tabs.FAQ, errors);

  if (errors.length) {
    reportErrors(errors);
    process.exit(1);
  }

  writeJson('site.json', site);
  writeJson('drinks.json', drinks);
  writeJson('events.json', events);
  writeJson('whats-here.json', whatsHere);
  writeJson('faq.json', faq);

  const knowledge = writeKnowledge();
  console.log('Wrote src/content/site.json');
  console.log('Wrote src/content/drinks.json');
  console.log('Wrote src/content/events.json');
  console.log('Wrote src/content/whats-here.json');
  console.log('Wrote src/content/faq.json');
  console.log(`Wrote src/content/knowledge.json (${knowledge.chunks.length} chunks)`);
  console.log('Sync complete (legal.json unchanged)');
}

syncFromSheets().catch((err) => {
  const msg = err.message ?? String(err);
  if (msg.includes('Requested entity was not found') || err.code === 404) {
    console.error('Sync failed: spreadsheet not found or not shared with the service account.');
    console.error('  • Use only the Sheet ID or full URL in GOOGLE_SHEET_ID');
    console.error('  • Share the sheet with the service account email as Viewer');
    console.error('  • Confirm tab names: _Settings, Hours, Drinks, Events, WhatsHere, FAQ, AskClara');
  } else {
    console.error('Sync failed:', msg);
  }
  process.exit(1);
});

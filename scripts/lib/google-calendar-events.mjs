import { google } from 'googleapis';

const META_LINE =
  /^(TAG|TIME|TICKETS|RSVP|TIME_LABEL):\s*(.+)$/i;

function normalizeCalendarId(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  const srcMatch = raw.match(/[?&]src=([^&]+)/);
  if (srcMatch) return decodeURIComponent(srcMatch[1].replace(/\+/g, ' '));

  const icalMatch = raw.match(/ical\/([^/]+)/);
  if (icalMatch) return decodeURIComponent(icalMatch[1]);

  return raw;
}

function deriveMonthDay(iso) {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'America/Chicago' }).toUpperCase();
  const day = d.toLocaleString('en-US', { day: '2-digit', timeZone: 'America/Chicago' });
  return { month, day };
}

function formatTimeRange(startIso, endIso) {
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' };
  const start = new Date(startIso).toLocaleTimeString('en-US', opts);
  const end = new Date(endIso).toLocaleTimeString('en-US', opts);
  return `${start}–${end}`;
}

function parseDescriptionMetadata(description) {
  const meta = { tag: '', timeLabel: '', ticketUrl: '', bodyLines: [] };

  for (const line of String(description ?? '').split(/\r?\n/)) {
    const match = line.trim().match(META_LINE);
    if (!match) {
      meta.bodyLines.push(line);
      continue;
    }

    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'tag') meta.tag = value;
    else if (key === 'time' || key === 'time_label') meta.timeLabel = value;
    else if (key === 'tickets' || key === 'rsvp') meta.ticketUrl = value;
  }

  return {
    tag: meta.tag,
    timeLabel: meta.timeLabel,
    ticketUrl: meta.ticketUrl,
    desc: meta.bodyLines.join('\n').trim(),
  };
}

function firstHttpUrl(text) {
  const match = String(text ?? '').match(/https?:\/\/[^\s<>"')\]]+/i);
  return match ? match[0] : '';
}

function mapCalendarEvent(event, errors) {
  const title = String(event.summary ?? '').trim();
  if (!title) {
    errors.push(`Google Calendar event ${event.id ?? '(unknown)'}: missing title (summary)`);
    return null;
  }

  let start;
  let end;

  if (event.start?.dateTime && event.end?.dateTime) {
    start = event.start.dateTime;
    end = event.end.dateTime;
  } else if (event.start?.date && event.end?.date) {
    start = `${event.start.date}T00:00:00-06:00`;
    end = `${event.end.date}T00:00:00-06:00`;
  } else {
    errors.push(`Google Calendar "${title}": missing start/end`);
    return null;
  }

  if (new Date(end) <= new Date(start)) {
    errors.push(`Google Calendar "${title}": end must be after start`);
    return null;
  }

  const parsed = parseDescriptionMetadata(event.description);
  const tag = parsed.tag || 'Event';
  const timeLabel =
    parsed.timeLabel ||
    (event.start?.date ? 'All day' : formatTimeRange(start, end));
  const location = String(event.location ?? '').trim();
  const ticketUrl =
    parsed.ticketUrl ||
    firstHttpUrl(event.description) ||
    (/^https?:\/\//i.test(location) ? location : '');

  const desc = parsed.desc || String(event.description ?? '').trim() || title;
  const { month, day } = deriveMonthDay(start);

  const item = {
    start,
    end,
    month,
    day,
    tag,
    title,
    timeLabel,
    desc,
  };

  if (ticketUrl) item.ticketUrl = ticketUrl;

  return item;
}

export async function fetchCalendarEvents(credentials, calendarIdInput, errors) {
  const calendarId = normalizeCalendarId(calendarIdInput);
  if (!calendarId) {
    errors.push('google_calendar_id is required when events_source is "calendar" or "both"');
    return [];
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 1);

  const items = [];
  let pageToken;

  do {
    const res = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
      pageToken,
    });

    for (const event of res.data.items ?? []) {
      if (event.status === 'cancelled') continue;
      const mapped = mapCalendarEvent(event, errors);
      if (mapped) items.push(mapped);
    }

    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return items;
}

export { normalizeCalendarId };

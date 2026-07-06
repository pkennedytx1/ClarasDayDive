/**
 * Clara's Day Dive — Import Google Calendar events into the Events sheet tab.
 *
 * Optional. Use when staff draft in Google Calendar but the sheet remains
 * the publish source (events_source = sheet).
 *
 * Requires google_calendar_id in _Settings, or Script property GOOGLE_CALENDAR_ID.
 *
 * Menu wired from PublishSite.gs → "Import events from calendar".
 */

var EVENTS_SHEET = 'Events';
var SETTINGS_SHEET = '_Settings';
var TZ = 'America/Chicago';

var META_LINE = /^(TAG|TIME|TICKETS|RSVP|TIME_LABEL):\s*(.+)$/i;

function importEventsFromCalendar() {
  var ui = SpreadsheetApp.getUi();
  var calendarId = resolveCalendarId_();

  if (!calendarId) {
    ui.alert(
      'Calendar not configured',
      'Set google_calendar_id in the _Settings tab, or GOOGLE_CALENDAR_ID in Script properties.',
      ui.ButtonSet.OK
    );
    return;
  }

  var confirm = ui.alert(
    'Import events from calendar?',
    'This replaces all rows on the Events tab (keeps the header row).\n\nReview imported events before Publish site.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    return;
  }

  var calendar;
  try {
    calendar = CalendarApp.getCalendarById(calendarId);
  } catch (e) {
    ui.alert('Calendar error', String(e.message || e), ui.ButtonSet.OK);
    return;
  }

  if (!calendar) {
    ui.alert(
      'Calendar not found',
      'Could not open calendar:\n' + calendarId + '\n\nMake sure this Google account can see that calendar.',
      ui.ButtonSet.OK
    );
    return;
  }

  var start = new Date();
  start.setMonth(start.getMonth() - 1);
  var end = new Date();
  end.setMonth(end.getMonth() + 12);

  var events = calendar.getEvents(start, end);
  var rows = [];

  for (var i = 0; i < events.length; i++) {
    var row = mapEventToRow_(events[i], i + 1);
    if (row) {
      rows.push(row);
    }
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EVENTS_SHEET);
  if (!sheet) {
    ui.alert('Missing tab', 'Create an "' + EVENTS_SHEET + '" tab first.', ui.ButtonSet.OK);
    return;
  }

  var lastRow = Math.max(sheet.getLastRow(), 1);
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  ui.alert(
    'Import complete',
    'Imported ' + rows.length + ' event(s) into the Events tab.\n\nReview and edit, then Publish site.',
    ui.ButtonSet.OK
  );
}

function resolveCalendarId_() {
  var props = PropertiesService.getScriptProperties();
  var fromProp = String(props.getProperty('GOOGLE_CALENDAR_ID') || '').trim();
  if (fromProp) {
    return normalizeCalendarId_(fromProp);
  }

  var settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
  if (!settings) {
    return '';
  }

  var values = settings.getDataRange().getValues();
  for (var r = 0; r < values.length; r++) {
    if (String(values[r][0]).trim() === 'google_calendar_id') {
      return normalizeCalendarId_(String(values[r][1] || '').trim());
    }
  }

  return '';
}

function normalizeCalendarId_(raw) {
  var srcMatch = raw.match(/[?&]src=([^&]+)/);
  if (srcMatch) {
    return decodeURIComponent(srcMatch[1].replace(/\+/g, ' '));
  }
  var icalMatch = raw.match(/ical\/([^/]+)/);
  if (icalMatch) {
    return decodeURIComponent(icalMatch[1]);
  }
  return raw;
}

function mapEventToRow_(event, sortOrder) {
  var title = String(event.getTitle() || '').trim();
  if (!title) {
    return null;
  }

  var parsed = parseDescription_(event.getDescription());
  var tag = parsed.tag || 'Event';
  var timeLabel = parsed.timeLabel || '';
  var ticketUrl = parsed.ticketUrl || '';
  var description = parsed.body || String(event.getDescription() || '').trim() || title;

  var start = formatChicago_(event.getStartTime());
  var end = formatChicago_(event.getEndTime());

  return [title, start, end, tag, timeLabel, description, ticketUrl, sortOrder, 'TRUE'];
}

function parseDescription_(text) {
  var result = { tag: '', timeLabel: '', ticketUrl: '', body: '' };
  var bodyLines = [];
  var lines = String(text || '').split(/\r?\n/);

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var match = line.match(META_LINE);
    if (!match) {
      bodyLines.push(lines[i]);
      continue;
    }
    var key = match[1].toLowerCase();
    var value = match[2].trim();
    if (key === 'tag') {
      result.tag = value;
    } else if (key === 'time' || key === 'time_label') {
      result.timeLabel = value;
    } else if (key === 'tickets' || key === 'rsvp') {
      result.ticketUrl = value;
    }
  }

  result.body = bodyLines.join('\n').trim();
  if (!result.ticketUrl) {
    var urlMatch = String(text || '').match(/https?:\/\/[^\s<>"')\]]+/i);
    if (urlMatch) {
      result.ticketUrl = urlMatch[0];
    }
  }

  return result;
}

function formatChicago_(date) {
  return Utilities.formatDate(date, TZ, 'yyyy-MM-dd HH:mm');
}

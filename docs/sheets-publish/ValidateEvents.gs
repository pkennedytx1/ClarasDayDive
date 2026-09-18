/**
 * Clara's Day Dive — Validate sheet content before publish.
 *
 * Mirrors checks in scripts/sync-from-sheets.mjs (active rows only).
 * Called automatically from Publish site (PublishSite.gs) — not a separate menu item.
 */

var VALIDATE_EVENTS_SHEET = 'Events';

var DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/;
var DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var OPTIONAL_SETTINGS_KEYS = {
  instagram_url: true,
  facebook_url: true,
  tiktok_url: true,
  google_business_url: true,
  google_site_verification: true,
  gallery_eyebrow: true,
  gallery_title: true,
  under_construction: true,
  under_construction_password: true,
  events_inquiry_email: true,
  events_inquiry_from: true,
  events_booking_cta: true,
  drinks_eyebrow: true,
  drinks_title: true,
  events_eyebrow: true,
  events_title: true,
  contact_eyebrow: true,
  contact_title: true,
  contact_lead: true,
  whats_here_eyebrow: true,
  whats_here_title: true,
  faq_eyebrow: true,
  faq_title: true,
  general_inquiry_email: true,
  general_inquiry_from: true,
  contact_us_eyebrow: true,
  contact_us_title: true,
  contact_us_lead: true,
  contact_us_button: true,
  general_contact_eyebrow: true,
  general_contact_title: true,
  general_contact_pitch: true,
  general_contact_button: true,
  general_contact_note: true,
  event_contact_eyebrow: true,
  event_contact_title: true,
  event_contact_pitch: true,
  event_contact_button: true,
  event_contact_note: true,
};

var DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

var DAY_ABBR = {
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

var WHATS_HERE_ICONS = {
  truck: true,
  'food-truck': true,
  coffee: true,
  sun: true,
};

/**
 * Validate all content tabs (same rules as npm run sync:content).
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateAllContentTabs() {
  var errors = [];
  var warnings = [];
  var settings = validateSettingsTab_(errors);

  validateHoursTab_(errors);
  validateDrinksTab_(errors);

  var eventsResult = validateEventsTab();
  errors = errors.concat(eventsResult.errors);
  warnings = warnings.concat(eventsResult.warnings);

  validateWhatsHereTab_(errors);
  validateFaqTab_(errors);
  validateAskClaraTab_(errors);
  validateKnowledgeTab_(errors);
  validatePhotosTab_(errors);
  validateEventsSourceSettings_(settings, errors);

  return { errors: errors, warnings: warnings };
}

/**
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateEventsTab() {
  var errors = [];
  var warnings = [];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATE_EVENTS_SHEET);

  if (!sheet) {
    errors.push('Events tab not found.');
    return { errors: errors, warnings: warnings };
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { errors: errors, warnings: warnings };
  }

  var col = buildColumnMap_(data[0]);
  var missing = ['title', 'start_datetime', 'end_datetime', 'tag', 'description', 'active'].filter(function (key) {
    return col[key] === undefined;
  });

  if (missing.length) {
    errors.push('Events row 1: missing column(s): ' + missing.join(', '));
    return { errors: errors, warnings: warnings };
  }

  var featuredRows = [];

  for (var r = 1; r < data.length; r++) {
    var rowNum = r + 1;
    var row = data[r];

    if (isEmptyRow_(row)) {
      continue;
    }

    var active = parseSheetBool_(cell_(row, col, 'active', 'TRUE'));
    if (!active) {
      continue;
    }

    validateActiveEventRow_(row, rowNum, col, errors);

    if (parseSheetBool_(cell_(row, col, 'featured', ''))) {
      featuredRows.push(rowNum);
    }
  }

  if (featuredRows.length > 1) {
    warnings.push(
      'Multiple rows marked featured (rows ' +
        featuredRows.join(', ') +
        ') — the site highlights the earliest upcoming occurrence only.'
    );
  }

  return { errors: errors, warnings: warnings };
}

/**
 * Run before GitHub publish. Returns true when publish may continue.
 */
function validateEventsTabBeforePublish_() {
  var ui = SpreadsheetApp.getUi();
  var result = validateAllContentTabs();

  if (result.errors.length) {
    ui.alert(
      'Cannot publish — fix the sheet first',
      formatValidationMessages_(result.errors) +
        '\n\nFix the sheet, then click Publish site again.',
      ui.ButtonSet.OK
    );
    return false;
  }

  if (result.warnings.length) {
    var proceed = ui.alert(
      'Sheet warnings',
      formatValidationMessages_(result.warnings) + '\n\nPublish anyway?',
      ui.ButtonSet.YES_NO
    );
    if (proceed !== ui.Button.YES) {
      return false;
    }
  }

  return true;
}

/** @returns {Object<string, string>} settings key → value */
function validateSettingsTab_(errors) {
  var data = getRequiredSheetData_('_Settings', errors);
  var settings = {};
  if (!data || data.length < 2) {
    return settings;
  }

  var col = buildColumnMap_(data[0]);
  if (col.key === undefined) {
    errors.push('_Settings row 1: missing column "key"');
    return settings;
  }

  for (var r = 1; r < data.length; r++) {
    var rowNum = r + 1;
    var row = data[r];
    if (isEmptyRow_(row)) {
      continue;
    }

    var key = trim_(cell_(row, col, 'key', ''));
    var value = trim_(cell_(row, col, 'value', ''));

    if (!key) {
      errors.push('_Settings row ' + rowNum + ': "key" is required');
      continue;
    }
    if (!value && !OPTIONAL_SETTINGS_KEYS[key]) {
      errors.push('_Settings row ' + rowNum + ': "value" is required');
      continue;
    }
    settings[key] = value;
  }

  if (settings.contact_email && !EMAIL_RE.test(settings.contact_email)) {
    errors.push('_Settings: contact_email "' + settings.contact_email + '" is not a valid email');
  }
  if (settings.events_inquiry_email && !EMAIL_RE.test(settings.events_inquiry_email)) {
    errors.push('_Settings: events_inquiry_email "' + settings.events_inquiry_email + '" is not a valid email');
  }
  if (settings.events_inquiry_from && !EMAIL_RE.test(settings.events_inquiry_from)) {
    errors.push('_Settings: events_inquiry_from "' + settings.events_inquiry_from + '" is not a valid email');
  }

  return settings;
}

function validateHoursTab_(errors) {
  validateActiveRows_('Hours', errors, function (row, rowNum, col) {
    var dayGroup = trim_(cell_(row, col, 'day_group', ''));
    var displayLabel = trim_(cell_(row, col, 'display_label', ''));
    var opens = trim_(cell_(row, col, 'opens', ''));
    var closes = trim_(cell_(row, col, 'closes', ''));

    if (!dayGroup) {
      errors.push('Hours row ' + rowNum + ': "day_group" is required');
    }
    if (!displayLabel) {
      errors.push('Hours row ' + rowNum + ': "display_label" is required');
    }
    if (!opens) {
      errors.push('Hours row ' + rowNum + ': "opens" is required');
    }
    if (!closes) {
      errors.push('Hours row ' + rowNum + ': "closes" is required');
    }
    if (dayGroup && !parseDayGroup_(dayGroup).length) {
      errors.push('Hours row ' + rowNum + ': could not parse day_group "' + dayGroup + '"');
    }
  });
}

function validateDrinksTab_(errors) {
  validateActiveRows_('Drinks', errors, function (row, rowNum, col) {
    var name = trim_(cell_(row, col, 'name', ''));
    var category = trim_(cell_(row, col, 'category', ''));
    var priceRaw = trim_(cell_(row, col, 'price', ''));

    if (!name) {
      errors.push('Drinks row ' + rowNum + ': "name" is required');
    }
    if (!category) {
      errors.push('Drinks row ' + rowNum + ': "category" is required');
    }
    if (priceRaw && parseNumericPrice_(priceRaw) === null) {
      errors.push('Drinks row ' + rowNum + ': price "' + priceRaw + '" must be numeric');
    }
  });
}

function validateWhatsHereTab_(errors) {
  validateActiveRows_('WhatsHere', errors, function (row, rowNum, col) {
    var title = trim_(cell_(row, col, 'title', ''));
    var tag = trim_(cell_(row, col, 'tag', ''));
    var body = trim_(cell_(row, col, 'body', ''));
    var icon = trim_(cell_(row, col, 'icon', '')).toLowerCase();

    if (!title) {
      errors.push('WhatsHere row ' + rowNum + ': "title" is required');
    }
    if (!tag) {
      errors.push('WhatsHere row ' + rowNum + ': "tag" is required');
    }
    if (!body) {
      errors.push('WhatsHere row ' + rowNum + ': "body" is required');
    }
    if (!icon) {
      errors.push('WhatsHere row ' + rowNum + ': "icon" is required');
    } else if (!WHATS_HERE_ICONS[icon]) {
      errors.push(
        'WhatsHere row ' + rowNum + ': icon "' + icon + '" must be food-truck, truck, coffee, or sun'
      );
    }
  });
}

function validateFaqTab_(errors) {
  validateActiveRows_('FAQ', errors, function (row, rowNum, col) {
    if (!trim_(cell_(row, col, 'question', ''))) {
      errors.push('FAQ row ' + rowNum + ': "question" is required');
    }
    if (!trim_(cell_(row, col, 'answer', ''))) {
      errors.push('FAQ row ' + rowNum + ': "answer" is required');
    }
  });
}

function validateAskClaraTab_(errors) {
  validateActiveRows_('AskClara', errors, function (row, rowNum, col) {
    if (!trim_(cell_(row, col, 'suggestion', ''))) {
      errors.push('AskClara row ' + rowNum + ': "suggestion" is required');
    }
    if (!trim_(cell_(row, col, 'response', ''))) {
      errors.push('AskClara row ' + rowNum + ': "response" is required');
    }
  });
}

function validateKnowledgeTab_(errors) {
  validateActiveRows_('Knowledge', errors, function (row, rowNum, col) {
    if (!trim_(cell_(row, col, 'topic', ''))) {
      errors.push('Knowledge row ' + rowNum + ': "topic" is required');
    }
    if (!trim_(cell_(row, col, 'fact', ''))) {
      errors.push('Knowledge row ' + rowNum + ': "fact" is required');
    }
  }, true);
}

function validatePhotosTab_(errors) {
  validateActiveRows_('Photos', errors, function (row, rowNum, col) {
    if (!trim_(cell_(row, col, 'image_url', ''))) {
      errors.push('Photos row ' + rowNum + ': "image_url" is required');
    }
    if (!trim_(cell_(row, col, 'alt_text', ''))) {
      errors.push('Photos row ' + rowNum + ': "alt_text" is required');
    }
  }, true);
}

function validateEventsSourceSettings_(settings, errors) {
  var source = trim_(settings.events_source || 'sheet').toLowerCase();
  if (source !== 'sheet' && source !== 'calendar' && source !== 'both') {
    errors.push('_Settings events_source must be sheet, calendar, or both (got "' + source + '")');
    return;
  }
  if ((source === 'calendar' || source === 'both') && !trim_(settings.google_calendar_id || '')) {
    errors.push(
      'events_source includes Google Calendar but google_calendar_id (or GOOGLE_CALENDAR_ID) is not set'
    );
  }
}

function validateActiveRows_(sheetName, errors, validateRow, optional) {
  var data = optional ? getOptionalSheetData_(sheetName) : getRequiredSheetData_(sheetName, errors);
  if (!data || data.length < 2) {
    return;
  }

  var col = buildColumnMap_(data[0]);
  for (var r = 1; r < data.length; r++) {
    var rowNum = r + 1;
    var row = data[r];
    if (isEmptyRow_(row)) {
      continue;
    }
    if (!parseSheetBool_(cell_(row, col, 'active', 'TRUE'))) {
      continue;
    }
    validateRow(row, rowNum, col);
  }
}

function getRequiredSheetData_(sheetName, errors) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    errors.push(sheetName + ' tab not found.');
    return null;
  }
  return sheet.getDataRange().getValues();
}

function getOptionalSheetData_(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return null;
  }
  return sheet.getDataRange().getValues();
}

function parseDayGroup_(dayGroup) {
  var raw = trim_(dayGroup);
  if (!raw) {
    return [];
  }

  var rangeMatch = raw.match(/^(\w+)\s*[–—-]\s*(\w+)$/i);
  if (rangeMatch) {
    var startIdx = findDayIndex_(rangeMatch[1]);
    var endIdx = findDayIndex_(rangeMatch[2]);
    if (startIdx >= 0 && endIdx >= 0) {
      var days = [];
      for (var i = startIdx; ; i = (i + 1) % 7) {
        days.push(DAY_NAMES[i]);
        if (i === endIdx) {
          break;
        }
      }
      return days;
    }
  }

  return raw.split(/[,;|]/).map(function (part) {
    return trim_(part);
  }).filter(function (part) {
    return part !== '';
  }).map(function (part) {
    var lower = part.toLowerCase();
    if (DAY_ABBR[lower.slice(0, 4)] || DAY_ABBR[lower.slice(0, 3)]) {
      return DAY_ABBR[lower.slice(0, 4)] || DAY_ABBR[lower.slice(0, 3)];
    }
    for (var d = 0; d < DAY_NAMES.length; d++) {
      var name = DAY_NAMES[d];
      if (name.toLowerCase() === lower || name.toLowerCase().indexOf(lower.slice(0, 3)) === 0) {
        return name;
      }
    }
    return part;
  });
}

function findDayIndex_(token) {
  var prefix = token.toLowerCase().slice(0, 3);
  for (var i = 0; i < DAY_NAMES.length; i++) {
    if (DAY_NAMES[i].toLowerCase().indexOf(prefix) === 0) {
      return i;
    }
  }
  return -1;
}

function parseNumericPrice_(raw) {
  var cleaned = String(raw).replace(/[$,\s]/g, '');
  if (cleaned === '' || isNaN(Number(cleaned))) {
    return null;
  }
  return Number(cleaned);
}

function validateActiveEventRow_(row, rowNum, col, errors) {
  var title = trim_(cell_(row, col, 'title', ''));
  var startRaw = trim_(cell_(row, col, 'start_datetime', ''));
  var endRaw = trim_(cell_(row, col, 'end_datetime', ''));
  var tag = trim_(cell_(row, col, 'tag', ''));
  var description = trim_(cell_(row, col, 'description', ''));

  if (!title) {
    errors.push('Events row ' + rowNum + ': "title" is required');
  }
  if (!startRaw) {
    errors.push('Events row ' + rowNum + ': "start_datetime" is required');
  }
  if (!endRaw) {
    errors.push('Events row ' + rowNum + ': "end_datetime" is required');
  }
  if (!tag) {
    errors.push('Events row ' + rowNum + ': "tag" is required');
  }
  if (!description) {
    errors.push('Events row ' + rowNum + ': "description" is required');
  }

  var startLocal = null;
  var endLocal = null;

  try {
    startLocal = parseLocalDatetime_(startRaw);
  } catch (err) {
    errors.push('Events row ' + rowNum + ': ' + err.message);
  }

  try {
    endLocal = parseLocalDatetime_(endRaw);
  } catch (err) {
    errors.push('Events row ' + rowNum + ': ' + err.message);
  }

  if (startLocal && endLocal && !isEndAfterStart_(startLocal, endLocal)) {
    errors.push('Events row ' + rowNum + ': end_datetime must be after start_datetime');
  }

  validateRecurrence_(row, rowNum, col, startLocal, errors);
}

function validateRecurrence_(row, rowNum, col, startLocal, errors) {
  var recurrence = trim_(cell_(row, col, 'recurrence', '')).toLowerCase();
  var untilRaw = trim_(cell_(row, col, 'recurrence_until', ''));

  if (!recurrence) {
    if (untilRaw) {
      errors.push('Events row ' + rowNum + ': recurrence_until should be empty when recurrence is not set');
    }
    return;
  }

  if (recurrence !== 'weekly') {
    errors.push('Events row ' + rowNum + ': recurrence must be empty or "weekly" (got "' + recurrence + '")');
    return;
  }

  if (!untilRaw) {
    errors.push('Events row ' + rowNum + ': recurrence_until required when recurrence is weekly');
    return;
  }

  var until;
  try {
    until = parseRecurrenceUntil_(untilRaw);
  } catch (err) {
    errors.push('Events row ' + rowNum + ': ' + err.message);
    return;
  }

  if (startLocal && compareYmd_(until, startLocal) < 0) {
    errors.push('Events row ' + rowNum + ': recurrence_until must be on or after start date');
  }
}

function buildColumnMap_(headerRow) {
  var col = {};
  for (var i = 0; i < headerRow.length; i++) {
    var key = normalizeHeader_(headerRow[i]);
    if (key) {
      col[key] = i;
    }
  }
  return col;
}

function normalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function cell_(row, col, key, fallback) {
  var index = col[key];
  if (index === undefined) {
    return fallback;
  }
  return row[index];
}

function trim_(value) {
  return String(value == null ? '' : value).trim();
}

function isEmptyRow_(row) {
  for (var i = 0; i < row.length; i++) {
    if (trim_(row[i]) !== '') {
      return false;
    }
  }
  return true;
}

function parseSheetBool_(value) {
  var val = trim_(value).toUpperCase();
  return val !== 'FALSE' && val !== '0' && val !== 'NO';
}

function parseLocalDatetime_(str) {
  var m = String(str).trim().match(DATETIME_RE);
  if (!m) {
    throw new Error('Invalid datetime "' + str + '" — expected YYYY-MM-DD HH:MM');
  }
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };
}

function parseRecurrenceUntil_(str) {
  var m = String(str).trim().match(DATE_RE);
  if (!m) {
    throw new Error('Invalid recurrence_until "' + str + '" — expected YYYY-MM-DD');
  }
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
  };
}

function compareYmd_(a, b) {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

function isEndAfterStart_(start, end) {
  if (start.year !== end.year) {
    return end.year > start.year;
  }
  if (start.month !== end.month) {
    return end.month > start.month;
  }
  if (start.day !== end.day) {
    return end.day > start.day;
  }
  if (start.hour !== end.hour) {
    return end.hour > start.hour;
  }
  return end.minute > start.minute;
}

function formatValidationMessages_(messages) {
  var max = 12;
  var lines = messages.slice(0, max);
  if (messages.length > max) {
    lines.push('…and ' + (messages.length - max) + ' more error(s).');
  }
  return lines.map(function (line) {
    return '• ' + line;
  }).join('\n');
}

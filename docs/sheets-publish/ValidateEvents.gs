/**
 * Clara's Day Dive — Validate Events tab before publish.
 *
 * Mirrors checks in scripts/sync-from-sheets.mjs (active rows only).
 * Called automatically from Publish site (PublishSite.gs) — not a separate menu item.
 */

var VALIDATE_EVENTS_SHEET = 'Events';

var DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/;
var DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

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
  var result = validateEventsTab();

  if (result.errors.length) {
    ui.alert(
      'Cannot publish — fix Events tab first',
      formatValidationMessages_(result.errors) +
        '\n\nFix the Events tab, then click Publish site again.',
      ui.ButtonSet.OK
    );
    return false;
  }

  if (result.warnings.length) {
    var proceed = ui.alert(
      'Events warnings',
      formatValidationMessages_(result.warnings) + '\n\nPublish anyway?',
      ui.ButtonSet.YES_NO
    );
    if (proceed !== ui.Button.YES) {
      return false;
    }
  }

  return true;
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

/**
 * Clara's Day Dive — Format the Events tab (headers, notes, example row styling).
 *
 * Menu wired from PublishSite.gs → "Format Events tab".
 * Safe to re-run after importing CSV or adding columns.
 */

var EVENTS_SHEET = 'Events';

var EVENT_HEADERS = [
  'title',
  'start_datetime',
  'end_datetime',
  'tag',
  'time_label',
  'description',
  'ticket_url',
  'active',
  'recurrence',
  'recurrence_until',
  'featured',
];

var HEADER_NOTES = {
  title: 'Event name shown on the site.',
  start_datetime: 'First date & start time. Format: YYYY-MM-DD HH:MM (Central). Example: 2026-09-19 19:00',
  end_datetime: 'End time on the same day. Must be after start. Example: 2026-09-19 22:00',
  tag: 'Badge label. Example: Live music, Market, Tasting',
  time_label: 'Display text for guests. Example: Every Friday · 7–10pm · Free',
  description: 'Event description paragraph.',
  ticket_url: 'Optional RSVP / ticket URL.',
  active: 'TRUE to publish, FALSE to hide without deleting.',
  recurrence: 'Blank = one-time. For weekly series type: weekly',
  recurrence_until: 'Required when recurrence = weekly. Last date: YYYY-MM-DD. Example: 2026-12-31',
  featured: 'TRUE on one row only to highlight the next upcoming occurrence on the homepage.',
};

function formatEventsTab() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EVENTS_SHEET);

  if (!sheet) {
    ui.alert('Missing tab', 'Create an "' + EVENTS_SHEET + '" tab first.', ui.ButtonSet.OK);
    return;
  }

  var width = EVENT_HEADERS.length;
  sheet.getRange(1, 1, 1, width).setValues([EVENT_HEADERS]);

  for (var c = 0; c < EVENT_HEADERS.length; c++) {
    var header = EVENT_HEADERS[c];
    var note = HEADER_NOTES[header];
    if (note) {
      sheet.getRange(1, c + 1).setNote(note);
    }
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#f3f0ea');

  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var activeCol = EVENT_HEADERS.indexOf('active') + 1;
    if (activeCol > 0) {
      for (var r = 2; r <= lastRow; r++) {
        var activeVal = String(sheet.getRange(r, activeCol).getValue()).trim().toUpperCase();
        var rowRange = sheet.getRange(r, 1, r, width);
        if (activeVal === 'FALSE') {
          rowRange.setFontStyle('italic').setFontColor('#6b6b66').setBackground('#f8f7f4');
        } else {
          rowRange.setFontStyle('normal').setFontColor(null).setBackground(null);
        }
      }
    }
  }

  ui.alert(
    'Events tab formatted',
    'Header row updated with column notes (hover the corner triangle).\n\nExample rows with active = FALSE are styled gray/italic.',
    ui.ButtonSet.OK
  );
}

/**
 * Clara's Day Dive — Publish site from Google Sheets
 *
 * Setup: see docs/sheets-publish/README.md
 *
 * Script properties (Project settings → Script properties):
 *   GITHUB_TOKEN  — GitHub PAT with repo + workflow dispatch access
 *   GITHUB_REPO   — owner/repo (e.g. simplifi/claras-day-dive)
 */

var MENU_NAME = "Clara's Day Dive";
var MENU_ITEM = 'Publish site';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_NAME)
    .addItem(MENU_ITEM, 'publishSite')
    .addToUi();
}

function publishSite() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GITHUB_TOKEN');
  var repo = props.getProperty('GITHUB_REPO');

  if (!token || !repo) {
    ui.alert(
      'Publish not configured',
      'Ask your developer to set GITHUB_TOKEN and GITHUB_REPO in Apps Script project properties.\n\nSee docs/sheets-publish/README.md in the repo.',
      ui.ButtonSet.OK
    );
    return;
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    ui.alert(
      'Invalid GITHUB_REPO',
      'GITHUB_REPO must look like owner/repo (e.g. myorg/claras-day-dive).',
      ui.ButtonSet.OK
    );
    return;
  }

  var confirm = ui.alert(
    'Publish site?',
    'This will sync this sheet and deploy the live site. It usually takes about 5 minutes.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    return;
  }

  var url = 'https://api.github.com/repos/' + repo + '/dispatches';
  var payload = {
    event_type: 'publish-site',
    client_payload: {
      source: 'google-sheets',
      spreadsheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),
      triggered_at: new Date().toISOString(),
    },
  };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();

  if (code === 204) {
    ui.alert(
      'Publish started',
      'GitHub is syncing the sheet and deploying the site. Check back in about 5 minutes.\n\nActions: github.com/' +
        repo +
        '/actions',
      ui.ButtonSet.OK
    );
    return;
  }

  ui.alert(
    'Publish failed (' + code + ')',
    response.getContentText() || 'No response body. Check the token, repo name, and that the GitHub workflow exists.',
    ui.ButtonSet.OK
  );
}

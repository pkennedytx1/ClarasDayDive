/**
 * Clara's Day Dive — Publish site from Google Sheets
 *
 * Setup: see docs/sheets-publish/README.md
 *
 * Script properties (Project settings → Script properties):
 *   GITHUB_TOKEN  — GitHub PAT (see README for permissions)
 *   GITHUB_REPO   — owner/repo (e.g. pkennedytx1/ClarasDayDive)
 */

var MENU_NAME = "Clara's Day Dive";
var MENU_ITEM = 'Publish site';
var WORKFLOW_FILE = 'publish.yml';
var DEFAULT_BRANCH = 'main';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_NAME)
    .addItem(MENU_ITEM, 'publishSite')
    .addToUi();
}

function publishSite() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var token = String(props.getProperty('GITHUB_TOKEN') || '').trim();
  var repo = String(props.getProperty('GITHUB_REPO') || '').trim();

  if (!token || !repo) {
    ui.alert(
      'Publish not configured',
      'Set GITHUB_TOKEN and GITHUB_REPO in Apps Script project properties.\n\nSee docs/sheets-publish/README.md',
      ui.ButtonSet.OK
    );
    return;
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    ui.alert(
      'Invalid GITHUB_REPO',
      'GITHUB_REPO must look like owner/repo (e.g. pkennedytx1/ClarasDayDive).',
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

  // workflow_dispatch — same as "Run workflow" in GitHub Actions UI
  var url =
    'https://api.github.com/repos/' +
    repo +
    '/actions/workflows/' +
    WORKFLOW_FILE +
    '/dispatches';
  var payload = { ref: DEFAULT_BRANCH };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: githubHeaders_(token),
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
    response.getContentText() ||
      'Check GITHUB_TOKEN permissions (Actions: Read and write) and GITHUB_REPO.',
    ui.ButtonSet.OK
  );
}

function githubHeaders_(token) {
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

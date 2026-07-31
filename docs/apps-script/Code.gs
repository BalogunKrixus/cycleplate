/* CyclePlate form receiver.

   Appends every submission to the spreadsheet this script is bound to, one
   sheet per form, and emails partner enquiries so they are not sitting in a
   spreadsheet nobody is watching.

   Deploy: Extensions > Apps Script, paste this in, then Deploy > New
   deployment > Web app, "Execute as: Me", "Who has access: Anyone". Copy the
   web app URL into the Vercel project as SHEET_WEBHOOK_URL.

   "Anyone" is required because Vercel calls this without a Google session.
   The URL is the only secret, so treat it as one: anyone holding it can add
   rows. Redeploy to rotate it. */

var NOTIFY = 'hellocycleplate@gmail.com';

// Column order per form. Anything posted that is not listed lands in "other".
var COLUMNS = {
  newsletter: ['submitted_at', 'email', 'first_name'],
  community: ['submitted_at', 'email', 'display_name', 'circle'],
  partner: ['submitted_at', 'email', 'org_name', 'contact_name', 'org_type', 'interest', 'message']
};

/* Health check, answering the two things that go wrong. Open the /exec URL in
   a private window: reaching this at all proves the deployment is callable
   without a Google session, and "sheet" names the spreadsheet the script is
   bound to. A sign-in page means "Who has access" is not "Anyone"; a null
   sheet means the project is standalone rather than created from inside a
   spreadsheet, and no row can ever be written. */
function doGet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  return json({
    ok: true,
    service: 'cycleplate-forms',
    sheet: book ? book.getName() : null
  });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var form = String(data.form || '').toLowerCase();
    if (!COLUMNS[form]) return json({ error: 'unknown form' });

    appendRow(form, data);
    if (form === 'partner') notify(data);

    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function appendRow(form, data) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(form) || book.insertSheet(form);
  var cols = COLUMNS[form];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cols.concat('other'));
    sheet.getRange(1, 1, 1, cols.length + 1).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var known = {};
  var row = cols.map(function (c) {
    known[c] = true;
    return data[c] === undefined ? '' : data[c];
  });

  var extra = Object.keys(data).filter(function (k) {
    return !known[k] && k !== 'form';
  }).map(function (k) {
    return k + ': ' + data[k];
  });

  sheet.appendRow(row.concat(extra.join(' | ')));
}

function notify(data) {
  var lines = Object.keys(data).filter(function (k) { return k !== 'form'; })
    .map(function (k) { return k + ': ' + data[k]; });

  MailApp.sendEmail({
    to: NOTIFY,
    replyTo: data.email || NOTIFY,
    subject: 'Partner enquiry: ' + (data.org_name || 'unknown organisation'),
    body: lines.join('\n') + '\n\nAdded to the partner sheet.'
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

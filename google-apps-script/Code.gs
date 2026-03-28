/**
 * Google Apps Script: contact form receiver
 * - Verifies Google reCAPTCHA (v2/v3 token) server-side
 * - Sends an email via MailApp with the submission
 * - Uses Script Properties for secrets: RECAPTCHA_SECRET and RECIPIENT_EMAIL
 *
 * Deployment: Deploy as Web App (Execute as: Me, Who has access: Anyone)
 */

function doPost(e) {
  // Parse incoming data (JSON or form-encoded)
  var params = {};
  if (e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1) {
    try { params = JSON.parse(e.postData.contents || '{}'); } catch (err) { params = {}; }
  } else if (e.parameter) {
    // e.parameter contains first values (URL-encoded or form POST)
    params = e.parameter;
  } else {
    params = {};
  }

  // Helpful aliases
  var token = params['g-recaptcha-response'] || params['g-recaptcha'] || '';
  var name = (params.name || '').trim();
  var email = (params.email || '').trim();
  var phone = (params.phone || '').trim();
  var interest = (params.interest || '').trim();
  var message = (params.message || '').trim();

  // Basic rate-limiting to slow repeated submissions (per email when available)
  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = 'sub:' + (email || Utilities.getUuid());
    if (cache.get(cacheKey)) {
      return jsonResponse({ success: false, message: 'Please wait before submitting again.' });
    }
    cache.put(cacheKey, '1', RATE_LIMIT_SECONDS);
  } catch (cacheErr) {
    // non-fatal — continue if cache unavailable
    Logger.log('Cache warning: ' + cacheErr);
  }

  var props = PropertiesService.getScriptProperties();
  var RECAPTCHA_SECRET = props.getProperty('RECAPTCHA_SECRET');
  var RECIPIENT_EMAIL = props.getProperty('RECIPIENT_EMAIL');
  var SUBMISSIONS_SHEET_ID = props.getProperty('SUBMISSIONS_SHEET_ID');
  var RECAPTCHA_MIN_SCORE = parseFloat(props.getProperty('RECAPTCHA_MIN_SCORE') || '0.5');
  var RATE_LIMIT_SECONDS = parseInt(props.getProperty('RATE_LIMIT_SECONDS') || '60', 10);

  if (!RECAPTCHA_SECRET || !RECIPIENT_EMAIL) {
    return jsonResponse({ success: false, message: 'Server not configured. Please set script properties.' });
  }

  // Basic validation
  if (!name || !email || !message) {
    return jsonResponse({ success: false, message: 'Missing required fields (name, email, message).' });
  }

  // Verify reCAPTCHA with Google
  try {
    var verifyRes = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: RECAPTCHA_SECRET, response: token },
      muteHttpExceptions: true
    });
    var verifyJson = JSON.parse(verifyRes.getContentText());
    if (!verifyJson || !verifyJson.success) {
      return jsonResponse({ success: false, message: 'reCAPTCHA verification failed', details: verifyJson });
    }

    // If using reCAPTCHA v3, enforce a minimum score (configurable via RECAPTCHA_MIN_SCORE script property)
    if (typeof verifyJson.score !== 'undefined' && !isNaN(RECAPTCHA_MIN_SCORE)) {
      if (verifyJson.score < RECAPTCHA_MIN_SCORE) {
        return jsonResponse({ success: false, message: 'reCAPTCHA suspicious (low score)', score: verifyJson.score, details: verifyJson });
      }
    }
  } catch (err) {
    return jsonResponse({ success: false, message: 'reCAPTCHA verification error', error: String(err) });
  }

  // Build email
  var subject = 'New enquiry for Rich Land Builders from ' + name;
  var body = 'You have a new enquiry from your website.\n\n'
           + 'Name: ' + name + '\n'
           + 'Email: ' + email + '\n'
           + 'Phone: ' + phone + '\n'
           + 'Interest: ' + interest + '\n\n'
           + 'Message:\n' + message + '\n\n';

  try {
    // Render HTML template (EmailTemplate.html) — excludes consent and from-page as requested
    var tpl = HtmlService.createTemplateFromFile('EmailTemplate');
    tpl.name = escapeHtml(name);
    tpl.email = escapeHtml(email);
    tpl.phone = escapeHtml(phone);
    tpl.interest = escapeHtml(interest);
    tpl.message = escapeHtml(message).replace(/\r?\n/g, '<br>');
    var htmlBody = tpl.evaluate().getContent();

    MailApp.sendEmail(RECIPIENT_EMAIL, subject, body, { htmlBody: htmlBody, replyTo: email });

    // Optionally append to a Google Sheet if `SUBMISSIONS_SHEET_ID` is set in Script Properties
    try {
      if (SUBMISSIONS_SHEET_ID) {
        appendSubmissionToSheet({
          timestamp: new Date(),
          name: name,
          email: email,
          phone: phone,
          interest: interest,
          message: message,
          status: 'New'
        }, SUBMISSIONS_SHEET_ID);
      }
    } catch (sheetErr) {
      Logger.log('Failed to append to sheet: ' + sheetErr);
    }
  } catch (err) {
    return jsonResponse({ success: false, message: 'Failed to send email', error: String(err) });
  }

  return jsonResponse({ success: true, message: 'Sent' });
}

function jsonResponse(obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

/** Escape HTML to prevent injection in templates */
function escapeHtml(str) {
  if (str === null || typeof str === 'undefined') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Append a submission to the configured Google Sheet.
 * Expects `sheetId` (string) and an object with fields: timestamp, name, email, phone, interest, message, status, notes
 */
function appendSubmissionToSheet(submission, sheetId) {
  if (!sheetId) return;
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0];

    // If sheet is empty, write headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Interest', 'Message', 'Status', 'Notes']);
    }

    var tz = Session.getScriptTimeZone();
    var ts = Utilities.formatDate(new Date(submission.timestamp), tz, 'dd/MM/yy HH:mm:ss');

    sheet.appendRow([
      ts,
      submission.name || '',
      submission.email || '',
      submission.phone || '',
      submission.interest || '',
      submission.message || '',
      submission.status || 'New',
      submission.notes || ''
    ]);
  } catch (e) {
    Logger.log('appendSubmissionToSheet error: ' + e);
    throw e;
  }
}

/**
 * Utility to update the Status cell for an existing row (row is sheet row index, 1-based).
 * Column 7 is 'Status' based on the header created above.
 */
function setSubmissionStatus(row, status) {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SUBMISSIONS_SHEET_ID');
  if (!sheetId) throw new Error('SUBMISSIONS_SHEET_ID is not set in Script Properties');
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheets()[0];
  sheet.getRange(row, 7).setValue(status);
}

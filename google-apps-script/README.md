Google Apps Script — Contact Form Receiver

What this does
- Receives POST requests from your site (JSON or form-encoded)
- Verifies Google reCAPTCHA server-side
- Sends the submission to an email address via `MailApp.sendEmail`

Setup
1. Open https://script.google.com/ and create a new project.
2. Create a new script file and paste the contents of `Code.gs`.
3. Open Project Settings → Script properties and add two properties:
   - `RECAPTCHA_SECRET` = your server secret key from Google reCAPTCHA
   - `RECIPIENT_EMAIL` = email address to receive submissions
    - `SUBMISSIONS_SHEET_ID` = (optional) Google Sheet ID to append submissions
4. Deploy → New deployment → select **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone (or Anyone, even anonymous)
5. Copy the Web App URL and use it as the form endpoint in your site.

Client (example)
Use a `fetch()` POST with `FormData` to avoid preflight complications:

```js
var url = 'https://script.google.com/macros/s/DEPLOY_ID/exec';
var fd = new FormData();
fd.append('name', document.getElementById('name').value);
fd.append('email', document.getElementById('email').value);
fd.append('phone', document.getElementById('phone').value);
fd.append('interest', document.getElementById('interest').value);
fd.append('message', document.getElementById('message').value);
fd.append('g-recaptcha-response', grecaptchaToken); // v2/v3 token from client

fetch(url, { method: 'POST', body: fd })
  .then(r => r.json())
  .then(json => console.log(json));
```

Notes & tips
- Use `FormData` or URL-encoded payloads to keep requests simple for Apps Script.
- Store secrets in Script Properties — do not commit them to source control.
- If you expect higher traffic, check Apps Script quotas (UrlFetch, MailApp).
- For extra spam protection, add a honeypot field and/or logging.

Security hardening
- The script now sanitizes values before rendering the HTML email to prevent HTML injection. No action required — this is automatic.
- Rate-limiting: the script uses `CacheService` to block repeated submissions for a short window. You can configure the window via the `RATE_LIMIT_SECONDS` script property (default `60`).
- reCAPTCHA v3 score threshold: to reject low-score submissions set `RECAPTCHA_MIN_SCORE` in Script Properties (default `0.5`). If a score is returned and is below this value the submission is rejected.
- Make sure to restrict Sheet sharing (Editor) only to necessary accounts to protect PII.

Form integration
- In your site, set the form’s endpoint using the `data-form-endpoint` attribute. Example:
   <form id="contact-form" data-form-endpoint="https://script.google.com/macros/s/DEPLOY_ID/exec">…</form>
- The `scripts/contact-page.js` in this repo reads `data-form-endpoint` and POSTs the form `FormData` to that URL.

HTML email template
- This project includes `EmailTemplate.html` which is used to format submission emails.
- `Code.gs` now renders `EmailTemplate.html` and sends it as the `htmlBody` of the message. Edit `EmailTemplate.html` to change styling or included fields.

Save submissions to Google Sheets
- To store submissions for follow-up, create a Google Sheet and set its ID in Script Properties as `SUBMISSIONS_SHEET_ID`.
- Recommended header row (first sheet): `Timestamp | Name | Email | Phone | Interest | Message | Status | Notes`.
- When a submission arrives the script will append a row with `Status` set to `New`.
- To mark an entry as contacted, either edit the `Status` cell in the Sheet, or run the helper `setSubmissionStatus(row, status)` from the Apps Script editor (where `row` is the sheet row number).

Notes
- Make sure the script's executing account has edit access to the target Sheet.
- If `SUBMISSIONS_SHEET_ID` is not set the script will continue to send emails but will not write to Sheets.

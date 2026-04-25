# GoDaddy Deployment Guide

This project is a static website. It can be hosted on GoDaddy if you have normal Linux hosting, cPanel hosting, or any hosting plan that allows direct file upload.

This guide is written as a practical checklist for launch.

## 0. Build The Minified Assets First

Before uploading anything, run the build step on your local machine.

Requirements:

- Node.js installed locally

Steps:

```
npm install
npm run build
```

What this does:

- Minifies all CSS files from `styles/` and writes them to `dist/styles/` with a content hash in the filename (e.g. `common.b7d03560.min.css`)
- Minifies all JS files from `scripts/` and writes them to `dist/scripts/` with a content hash (e.g. `home.9deba11f.min.js`)
- Updates all HTML files in-place so their `<link>` and `<script>` tags point at the hashed filenames

The content hash changes automatically whenever the file content changes. This allows browsers and CDNs to cache CSS and JS for 1 year safely, because a changed file gets a new name.

After running the build, commit the result. The `dist/` folder is committed to the repository because the HTML files depend on it at runtime. `node_modules/` is excluded from git and never uploaded.

If you edit any CSS or JS source file, run `npm run build` again before deploying.

## 1. Confirm The Hosting Type First

Before doing anything, check what exact GoDaddy product you are using.

Suitable hosting types:

- GoDaddy Web Hosting with cPanel
- GoDaddy Linux hosting with File Manager / FTP access
- Any external static hosting provider with GoDaddy domain DNS

Not suitable without rework:

- GoDaddy Website Builder
- Managed WordPress hosting, unless you plan to manually adapt the site into WordPress

If you do not have file upload access to a web root such as `public_html`, this project should not be deployed there as-is.

## 2. Files That Must Go Live

Upload the project exactly with the same structure.

Root files:

- `index.html`
- `address.html`
- `contact.html`
- `404.html`
- `privacy-policy.html`
- `robots.txt`
- `sitemap.xml`
- `.htaccess` — sets long cache headers for CSS, JS, and images on Apache/GoDaddy hosting
- `README.md` is optional and does not need to be uploaded

Folders that must be uploaded completely:

- `assets`
- `styles`
- `dist`

Do not rename folders or files after upload.

## 3. Recommended Upload Method In GoDaddy

If using GoDaddy cPanel hosting:

1. Log in to GoDaddy.
2. Open the hosting product.
3. Open `cPanel`.
4. Open `File Manager`.
5. Go to `public_html`.
6. Upload the website files there.
7. If there is an old site already in `public_html`, back it up before replacing anything.

Alternative method:

- use FTP or SFTP if GoDaddy provides credentials
- upload all project files to `public_html`

Important:

- `index.html` must sit directly inside `public_html`
- the `assets`, `scripts`, `styles`, and `dist` folders must also sit directly inside `public_html`
- `.htaccess` must sit directly inside `public_html`
- do not upload `node_modules/`

Expected live structure:

```text
public_html/
  .htaccess
  index.html
  address.html
  contact.html
  404.html
  privacy-policy.html
  robots.txt
  sitemap.xml
  assets/
  scripts/
  styles/
  dist/
    scripts/
      *.HASH.min.js
    styles/
      *.HASH.min.css
```

## 4. Domain Connection In GoDaddy

There are two common cases.

### Case A: Domain and hosting are both in GoDaddy

Usually this is simpler.

1. Make sure the domain is assigned to the correct hosting account.
2. In GoDaddy, verify the domain points to the hosting plan.
3. Wait for propagation if changes were just made.

### Case B: Domain is in GoDaddy, hosting is somewhere else

Then GoDaddy is only handling DNS.

You will need to update DNS records in GoDaddy using the values given by the hosting provider.

Usually:

- `A` record for the root domain
- `CNAME` record for `www`

Do not guess these values. Use the exact records from the host.

## 5. Pick The Primary Domain Format

Choose one live version and redirect the other to it.

Choose one of:

- `https://richlandbuilders.com`
- `https://www.richlandbuilders.com`

Recommended: keep one canonical version only.

After launch, test that:

- `http://domain` redirects to `https://domain`
- `http://www.domain` redirects correctly
- the non-primary version redirects to the primary version

## 6. SSL / HTTPS Setup In GoDaddy

Before the site is considered live:

1. Enable SSL from the GoDaddy hosting dashboard.
2. Wait until the certificate is active.
3. Open the live site in the browser using HTTPS.
4. Check that the padlock is visible.

Then confirm:

- homepage loads on HTTPS
- address page loads on HTTPS
- contact page loads on HTTPS
- no mixed-content warnings appear in browser console

## 7. Verify Domain URLs In The Code

This project already uses `https://www.richlandbuilders.com/` in metadata.

If the final live domain is different, update these files before launch:

- `index.html`
- `address.html`
- `contact.html`
- `sitemap.xml`
- `robots.txt` if sitemap URL changes

Update these values wherever needed:

- canonical URLs
- Open Graph URLs
- Twitter URLs
- JSON-LD structured data URLs
- alternate hreflang URLs

If the final domain is still `www.richlandbuilders.com`, no further change is needed here.

## 8. Forms And Brochure Capture Must Be Tested Live

This site sends enquiries and brochure leads to Google Apps Script. The full backend setup is documented in [google-apps-script/README.md](google-apps-script/README.md).

Current endpoint in the project:

- `https://script.google.com/macros/s/AKfycbzKz267S7D0dgpNygJJNo-D6AvXjnvDPphfa-NkWYfblhwfgjaOiOp1wLOxPslROceMPw/exec`

Apps Script setup steps:

1. Open https://script.google.com/ and create a new project.
2. Add the backend code from [google-apps-script/Code.gs](google-apps-script/Code.gs) and the email template from [google-apps-script/EmailTemplate.html](google-apps-script/EmailTemplate.html).
3. Open Project Settings and add the Script Properties used by the backend:
   - `RECAPTCHA_SECRET` = your server secret key from Google reCAPTCHA
   - `RECIPIENT_EMAIL` = email address to receive submissions
   - `SUBMISSIONS_SHEET_ID` = optional Google Sheet ID if you want Sheet logging
   - `RATE_LIMIT_SECONDS` and `RECAPTCHA_MIN_SCORE` = optional hardening settings
4. Deploy the project as a Web app with `Execute as: Me` and `Who has access: Anyone` or `Anyone, even anonymous`.
5. Copy the Web App URL into the site forms.
6. If the endpoint changes, update the contact form `data-form-endpoint` in [contact.html](contact.html) and the brochure form endpoint in [scripts/brochure-modal.js](scripts/brochure-modal.js).

Before launch, verify:

- the Apps Script deployment is live
- the deployment is accessible to the public if required
- submissions work from the final website domain
- the data reaches the Google Sheet or email target

Live tests you must perform:

1. submit the main contact form
2. submit brochure form from address hero
3. submit brochure form from apartments section
4. submit brochure form from villas section

Confirm that the submission data includes:

- name
- email
- phone
- source
- brochure filename when applicable

## 9. reCAPTCHA Setup For Production Domain

This site uses Google reCAPTCHA v3.

reCAPTCHA setup steps:

1. Open the Google reCAPTCHA admin console and select or create the v3 site key for this project.
2. Add the final production domain to the key.
3. Add both domain variants if both may be used during testing:
   - `richlandbuilders.com`
   - `www.richlandbuilders.com`
4. Copy the site key into the contact form in [contact.html](contact.html) and the brochure form logic in [scripts/brochure-modal.js](scripts/brochure-modal.js).
5. Store the matching secret key in Apps Script as `RECAPTCHA_SECRET`.
6. Confirm the live forms still submit successfully after the key is added.

Before launch, confirm the key is active for both domain variants. If the live domain is not listed there, forms may fail on production.

## 10. Confirm Project-Specific Content Is Final

Already completed in this project:

- RERA number has been added

Still verify on live pages:

- homepage RERA label shows correctly
- address page RERA label shows correctly
- brochure buttons work
- all phone numbers, email links, WhatsApp links, and map links open correctly

## 11. SEO Checks After Upload

Once the site is live, verify:

1. `robots.txt` opens in the browser
2. `sitemap.xml` opens in the browser
3. page titles are correct
4. meta descriptions are correct
5. Open Graph previews are correct

Then in Google Search Console:

1. add the live domain property
2. verify ownership
3. submit the sitemap
4. request indexing for important pages if needed

How to do each step:

1. Open https://search.google.com/search-console and sign in with the Google account that will manage the site.
2. Click Add property.
3. Choose Domain property.
4. Enter the root domain, such as `richlandbuilders.com`. A domain property covers `http`, `https`, `www`, and non-`www` versions. If you prefer a URL-prefix property instead, use the exact live URL such as `https://www.richlandbuilders.com/`.
5. Search Console will show a DNS TXT record.
6. Open GoDaddy DNS management for the domain.
7. Add the TXT record exactly as shown by Google.
8. Save the DNS change and wait for it to propagate.
9. Return to Search Console and click Verify.
10. After ownership is verified, open the Sitemaps page.
11. Enter `sitemap.xml` or the full sitemap URL, such as `https://www.richlandbuilders.com/sitemap.xml`.
12. Click Submit and wait for Search Console to accept the sitemap.
13. Open URL Inspection for the homepage, address page, and contact page.
14. Paste the full page URL, run the live test if needed, and click Request Indexing for the pages that matter most.

For this site, start with the homepage, address page, and contact page. After launch, check Search Console again over the next few days for crawl errors, pages not indexed yet, or any mobile usability issues.

## 12. 404 Page Setup In GoDaddy

The project includes a `404.html` page.

If GoDaddy hosting supports custom error page mapping, configure `404.html` as the custom 404 page.

Steps:

1. Log in to GoDaddy and open the hosting account for the live site.
2. Open cPanel or the hosting File Manager.
3. Make sure `404.html` is uploaded to the web root, usually `public_html`.
4. Open the custom error page or Error Pages tool.
5. Set the 404 Not Found page to `/404.html`.
6. Save the setting and wait a few minutes for it to apply.
7. Open a non-existent URL such as `https://yourdomain.com/this-page-does-not-exist` to confirm the custom page appears.

If your hosting plan lets you edit `.htaccess`, you can use an Apache `ErrorDocument 404 /404.html` rule instead.

If the fake URL shows your custom page, the 404 setup is working.

## 13. Mobile And Browser QA Checklist

Test these pages after the site is live:

- homepage
- address page
- contact page

Test on:

- Android Chrome
- iPhone Safari
- desktop Chrome
- desktop Edge

Specifically verify:

- homepage hero text fits cleanly
- homepage Address section cards stack properly on mobile
- address page hero buttons align correctly
- address page tabs switch correctly on mobile
- floorplan and gallery sections work properly
- enquire FAB and sections toggle do not cover important content
- contact form is easy to use on mobile
- WhatsApp button does not overlap form controls

## 14. Performance And Media Check

After upload, confirm:

- all images load
- `.webp` files load properly
- no broken CSS or JS paths exist
- no 404 errors appear in browser network tab for assets

Recommended:

- run Lighthouse on homepage
- run Lighthouse on address page
- run Lighthouse on contact page

## 15. GoDaddy Cache / Delay Notes

If changes do not appear immediately:

- clear GoDaddy cache if that option exists in the hosting panel
- clear browser cache
- test in incognito mode
- wait for DNS propagation if records were recently changed

DNS changes can take time. File uploads usually appear much faster than DNS updates.

## 16. Exact Launch Order

Use this order to avoid confusion.

1. run `npm run build` locally and commit the result
2. confirm GoDaddy hosting type supports static file upload
3. upload the site files to `public_html` (exclude `node_modules/`)
4. connect domain / verify DNS
5. enable SSL
6. confirm redirects to the primary domain
7. verify metadata URLs are correct
8. verify Google Apps Script form submissions
9. verify reCAPTCHA domain setup
10. test brochure flows
11. test contact form
12. test mobile layout
13. test 404 page
14. submit sitemap to Search Console

## 17. Final Go-Live Checklist

Before announcing the website, confirm all of the below are true:

- homepage opens correctly
- address page opens correctly
- contact page opens correctly
- SSL is active
- domain redirects are correct
- no broken images
- no broken CSS/JS
- enquiry form sends data successfully
- brochure form sends data successfully
- reCAPTCHA works on production domain
- RERA number is visible
- WhatsApp, phone, email, and map links work
- sitemap is accessible
- robots.txt is accessible
- 404 page works

## 18. Suggested Checks 24 Hours After Launch

After the site has been live for a day, confirm:

- forms are still being received
- brochure leads are still being received
- Search Console shows no major crawl issue
- sitemap fetch succeeded
- no stale metadata is showing on social preview tools
- no customer-facing issue has appeared on mobile
# GoDaddy Deployment Guide

This project is a static website. It can be hosted on GoDaddy if you have normal Linux hosting, cPanel hosting, or any hosting plan that allows direct file upload.

This guide is written as a practical checklist for launch.

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
- `README.md` is optional and does not need to be uploaded

Folders that must be uploaded completely:

- `assets`
- `scripts`
- `styles`

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
- the `assets`, `scripts`, and `styles` folders must also sit directly inside `public_html`

Expected live structure:

```text
public_html/
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

This site sends enquiries and brochure leads to Google Apps Script.

Current endpoint in the project:

- `https://script.google.com/macros/s/AKfycby2s6vbsSi6wxN7Af8r0YC-hEFRyrTW5SBZlPh4ib0vkYF-LfsVcJkkvmBqx93NMlf2qQ/exec`

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

Before launch:

1. Open Google reCAPTCHA admin.
2. Find the key used for this project.
3. Add the final production domain.
4. Add both versions if both may be hit during testing:
   - `richlandbuilders.com`
   - `www.richlandbuilders.com`

If the live domain is not listed there, forms may fail on production.

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

## 12. 404 Page Setup In GoDaddy

The project includes a `404.html` page.

If GoDaddy hosting supports custom error page mapping, configure `404.html` as the custom 404 page.

Then test by opening a fake URL such as:

- `https://yourdomain.com/this-page-does-not-exist`

You should see the custom 404 page instead of a generic host error page.

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

1. confirm GoDaddy hosting type supports static file upload
2. upload the site files to `public_html`
3. connect domain / verify DNS
4. enable SSL
5. confirm redirects to the primary domain
6. verify metadata URLs are correct
7. verify Google Apps Script form submissions
8. verify reCAPTCHA domain setup
9. test brochure flows
10. test contact form
11. test mobile layout
12. test 404 page
13. submit sitemap to Search Console

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
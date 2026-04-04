# Website Hosting Checklist

This project is a static website and can be hosted on GoDaddy or any other domain/hosting provider that supports static files.

## 1. Before Uploading

- Keep the folder structure exactly as it is.
- Upload all root files: `index.html`, `address.html`, `contact.html`, `404.html`, `privacy-policy.html`, `robots.txt`, `sitemap.xml`.
- Upload all folders without renaming them: `assets`, `scripts`, `styles`.
- Make sure file names stay lowercase and paths remain unchanged.

## 2. Domain And DNS Setup

- Point the domain to the correct hosting server using the provider's DNS panel.
- Decide the main version of the site:
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`
- Redirect the non-primary version to the primary version.
- If using GoDaddy DNS with separate hosting, confirm the `A` record or `CNAME` values with the hosting provider.

## 3. HTTPS / SSL

- Enable SSL before launch.
- Confirm both `www` and non-`www` versions load with HTTPS.
- Make sure there are no mixed-content warnings in the browser console.
- If the final domain changes, update all canonical and social preview URLs in the HTML files.

## 4. Update Domain URLs In The Project

Replace `https://www.richlandbuilders.com/` with the final live domain if it changes.

Check these in:

- `index.html`
- `address.html`
- `contact.html`
- `sitemap.xml`
- `robots.txt` if the sitemap URL changes

Update:

- canonical URLs
- Open Graph URLs
- Twitter URLs/images if needed
- structured data URLs
- alternate hreflang URLs

## 5. Contact Form And Brochure Lead Capture

This site uses a Google Apps Script endpoint for form submissions and brochure leads.

Current endpoint:

- `https://script.google.com/macros/s/AKfycby2s6vbsSi6wxN7Af8r0YC-hEFRyrTW5SBZlPh4ib0vkYF-LfsVcJkkvmBqx93NMlf2qQ/exec`

Before launch, verify:

- the Apps Script deployment is still active
- the deployment is published for external access if required
- submissions from the live domain are accepted
- form data is reaching the destination sheet or email workflow
- brochure modal submissions are also being recorded

Test these flows on the live domain:

- contact page enquiry form
- brochure download from address page hero
- brochure download from apartments section
- brochure download from villas section

## 6. reCAPTCHA Configuration

This site uses Google reCAPTCHA v3.

Current site key is already present in the code. Before launch:

- add the final production domain in the Google reCAPTCHA admin console
- add both domain versions if needed:
  - `yourdomain.com`
  - `www.yourdomain.com`
- test form submission on the live domain

If the domain is not added in reCAPTCHA, forms may silently fail or behave inconsistently.

## 7. RERA Number

Before launch, replace the RERA placeholders with the actual number in:

- `index.html`
- `address.html`

## 8. SEO And Indexing

- Confirm `robots.txt` is accessible.
- Confirm `sitemap.xml` is accessible.
- Submit the sitemap in Google Search Console.
- Add and verify the final domain in Google Search Console.
- Check page titles and meta descriptions after the final domain is set.
- Make sure `404.html` is configured as the custom error page if the host supports it.

## 9. Social Sharing Preview Check

After the site is live, test:

- homepage preview
- address page preview
- contact page preview

Check that:

- preview image loads correctly
- title is correct
- description is correct
- no old/staging domain appears

## 10. Mobile And Browser QA

Test on:

- Android Chrome
- iPhone Safari
- desktop Chrome
- desktop Edge or Safari

Verify:

- homepage carousel content fits properly
- address page hero buttons align correctly
- tabs switch correctly on mobile
- floating CTA buttons do not overlap important content
- gallery and floorplan sections scroll correctly
- contact form is easy to complete on mobile

## 11. Performance And Media Check

- Confirm all images load correctly from the `assets` folder.
- Check that `.webp` files are served correctly by the host.
- Verify there are no broken image paths after upload.
- Run a Lighthouse check on homepage, address page, and contact page.

## 12. Final Launch Checklist

- upload all files
- enable SSL
- connect domain
- confirm redirects
- update final URLs in metadata
- verify Apps Script form submissions
- verify reCAPTCHA domain configuration
- add real RERA number
- test brochure downloads
- test contact form
- test mobile layout
- test custom 404 page
- submit sitemap to Search Console

## 13. GoDaddy Notes

If hosted on GoDaddy:

- upload the project contents to the correct web root, usually `public_html`
- keep `index.html` in the root of the live site
- configure SSL from the GoDaddy dashboard
- use GoDaddy DNS only if the domain is managed there; otherwise update DNS where the nameservers point
- if GoDaddy caching delays changes, clear cache and test in an incognito window

## 14. Suggested Post-Launch Checks After 24 Hours

- confirm forms are still being received
- check Search Console for crawl issues
- check whether sitemap was fetched successfully
- test brochure download flow once more
- verify WhatsApp, phone, email, and map links
- confirm no page is loading old metadata or stale content
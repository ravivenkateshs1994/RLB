// Shared header and footer components
// Auto-detects the current page to set the correct active nav link.
(function () {
    var path = window.location.pathname;
    var isAddress = path.indexOf('address.html') !== -1;
    var isContact = path.indexOf('contact.html') !== -1;
    var is404     = path.indexOf('404.html') !== -1;
    var isHome    = !isAddress && !isContact && !is404;

    var homeHref    = isHome    ? '#hero'          : 'index.html';
    var aboutHref   = isHome    ? '#about'         : 'index.html#about';
    var valuesHref  = isHome    ? '#values'        : 'index.html#values';
    var addressHref = isAddress ? '#'              : 'address.html';
    var contactHref = 'contact.html';

    function navLink(href, label, isActive, isCurrent) {
        return '<a href="' + href + '" class="nav__link' + (isActive ? ' active' : '') + '"' +
               (isCurrent ? ' aria-current="page"' : '') + '>' + label + '</a>';
    }

    function mobileNavLink(href, label, isPrimary, isCurrent) {
        return '<a href="' + href + '" class="mobile-nav__link' +
               (isPrimary ? ' mobile-nav__link--primary' : '') + '"' +
               (isCurrent ? ' aria-current="page"' : '') + '>' + label + '</a>';
    }

    // ── HEADER ──────────────────────────────────────────────────────────────
    var headerPh = document.getElementById('site-header-placeholder');
    if (headerPh) {
        headerPh.outerHTML =
            '<header class="header" id="header">' +
              '<div class="header__container">' +
                '<div class="header__logo-container">' +
                  '<a href="index.html" aria-label="Rich Land Builders \u2013 Home">' +
                    '<img src="assets/logo/updated_logo.png" alt="Rich Land Builders Logo" class="header-logo" loading="eager" width="140" height="48">' +
                  '</a>' +
                '</div>' +
                '<nav class="nav" id="nav" aria-label="Primary">' +
                  navLink(homeHref,    'Home',        isHome,    false) +
                  navLink(aboutHref,   'About',       false,     false) +
                  navLink(valuesHref,  'Values',      false,     false) +
                  navLink(addressHref, 'The Address', isAddress, isAddress) +
                  navLink(contactHref, 'Contact Us',  isContact, isContact) +
                '</nav>' +
                '<button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">' +
                  '<svg class="mobile-menu-icon mobile-menu-icon--menu" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
                  '<svg class="mobile-menu-icon mobile-menu-icon--close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6l-12 12"/></svg>' +
                '</button>' +
              '</div>' +
            '</header>' +
            '<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile primary">' +
              mobileNavLink(homeHref,    'Home',        false, false) +
              mobileNavLink(aboutHref,   'About',       false, false) +
              mobileNavLink(valuesHref,  'Values',      false, false) +
              mobileNavLink(addressHref, 'The Address', false, isAddress) +
              mobileNavLink(contactHref, 'Contact Us',  true,  isContact) +
            '</nav>' +
            '<div class="mobile-nav-backdrop" id="mobile-nav-backdrop"></div>';
    }

    // ── FOOTER ──────────────────────────────────────────────────────────────
    var footerPh = document.getElementById('site-footer-placeholder');
    if (footerPh) {
        footerPh.outerHTML =
            '<footer class="footer" role="contentinfo">' +
              '<div class="container">' +
                '<div class="footer-content">' +
                  '<div class="footer-brand">' +
                    '<img src="assets/logo/updated_logo.png" alt="Rich Land Builders company logo" class="footer-logo-image" width="180" height="60" loading="lazy">' +
                    '<p class="footer-tagline">Where Dreams and Designs meet Reality!</p>' +
                    '<p class="vision-text">Crafting foundations with compassion in construction.</p>' +
                    '<p class="footer-location">' +
                      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>' +
                      ' Coimbatore, Tamil Nadu, India' +
                    '</p>' +
                  '</div>' +
                  '<div class="footer-links">' +
                    '<div class="footer-column">' +
                      '<h3>Quick Links</h3>' +
                      '<ul>' +
                        '<li><a href="index.html">Home</a></li>' +
                        '<li><a href="index.html#about">About</a></li>' +
                        '<li><a href="index.html#values">Values</a></li>' +
                        '<li><a href="address.html">The Address</a></li>' +
                        '<li><a href="contact.html">Contact</a></li>' +
                        '<li><a href="privacy-policy.html">Privacy Policy</a></li>' +
                      '</ul>' +
                    '</div>' +
                    '<div class="footer-column">' +
                      '<h3>Contact</h3>' +
                      '<ul>' +
                        '<li><a href="tel:+919087878414">+91 90878 78414</a></li>' +
                        '<li><a href="tel:+919087878432">+91 90878 78432</a></li>' +
                        '<li><a href="mailto:rlbenquiry@gmail.com">rlbenquiry@gmail.com</a></li>' +
                        '<li>4/300-6, EB Colony,<br> Mettupalayam Road,<br>Karamadai,<br>Coimbatore - 641104</li>' +
                      '</ul>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="footer-bottom">' +
                  '<p>&copy; 2026 Rich Land Builders (RLB). All rights reserved.</p>' +
                    '<p class="footer-recaptcha">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.</p>' +
                '</div>' +
              '</div>' +
            '</footer>';
    }
    // ── BROCHURE LEAD MODAL (shared across all pages) ────────────────────────
    var existingModal = document.getElementById('brochure-modal');
    if (!existingModal) {
        var modalEl = document.createElement('div');
        modalEl.id = 'brochure-modal';
        modalEl.className = 'brochure-modal';
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.setAttribute('aria-labelledby', 'brochure-modal-title');
        modalEl.setAttribute('hidden', '');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML =
            '<div class="brochure-modal__box">' +
                '<button class="brochure-modal__close" id="brochure-modal-close" type="button" aria-label="Close">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
                '<div class="brochure-modal__header">' +
                    '<div class="brochure-modal__icon" aria-hidden="true">' +
                        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
                    '</div>' +
                    '<h2 class="brochure-modal__title" id="brochure-modal-title">Download Brochure</h2>' +
                    '<p class="brochure-modal__sub">Share your details and we\u2019ll get the brochure across to you.</p>' +
                '</div>' +
                '<form class="brochure-modal__form" id="brochure-modal-form" novalidate>' +
                    '<div class="form-group">' +
                        '<label class="form-label" for="bm-name">Full Name <span aria-hidden="true">*</span></label>' +
                        '<input class="form-control" id="bm-name" name="bm-name" type="text" autocomplete="name" required placeholder="Your name">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label class="form-label" for="bm-phone">Phone <span aria-hidden="true">*</span></label>' +
                        '<input class="form-control" id="bm-phone" name="bm-phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label class="form-label" for="bm-email">Email <span aria-hidden="true">*</span></label>' +
                        '<input class="form-control" id="bm-email" name="bm-email" type="email" autocomplete="email" required placeholder="you@email.com">' +
                    '</div>' +
                    '<div id="brochure-modal-status" class="brochure-modal__status" aria-live="polite"></div>' +
                    '<button type="submit" id="brochure-modal-submit" class="btn btn--submit brochure-modal__submit">' +
                        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
                        'Get Brochure' +
                    '</button>' +
                '</form>' +
                '<p class="brochure-modal__privacy">Your details are kept private and never shared with third parties.</p>' +
            '</div>';
        document.body.appendChild(modalEl);
    }
})();

// Shared header and footer components
// Auto-detects the current page to set the correct active nav link.
(function () {
    var path = window.location.pathname;
    var isAddress = path.indexOf('address.html') !== -1;
    var isContact = path.indexOf('contact.html') !== -1;
    var isHome    = !isAddress && !isContact;

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
                        '<li><a href="mailto:info@richlandbuilders.com">info@richlandbuilders.com</a></li>' +
                        '<li>JV Avenue PHASE - 3,<br>Thirumurugan Nagar,<br>Kalapatti,<br>Coimbatore - 641048</li>' +
                      '</ul>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="footer-bottom">' +
                  '<p>&copy; 2026 Rich Land Builders (RLB). All rights reserved.</p>' +
                '</div>' +
              '</div>' +
            '</footer>';
    }
})();

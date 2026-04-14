(function () {
    'use strict';

    var FORM_ENDPOINT   = 'https://script.google.com/macros/s/AKfycby2s6vbsSi6wxN7Af8r0YC-hEFRyrTW5SBZlPh4ib0vkYF-LfsVcJkkvmBqx93NMlf2qQ/exec';
    var RECAPTCHA_KEY   = '6LcVZ5ssAAAAALCYHq7-b1BvtdVuRnOEqr3dnu_c';

    var BROCHURE_PDF    = 'assets/brochure.pdf'; // PDF path never exposed in HTML

    var pendingHref     = null;
    var pendingFilename = null;
    var pendingSource   = null;

    function getSubmissionSource() {
        if (pendingSource) {
            if (pendingSource.indexOf('Address page') === 0) return 'Address page';
            if (pendingSource.indexOf('Homepage') === 0) return 'Homepage';
        }

        var path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
        if (!path || path === '/' || path === '/index.html' || path === '/index.htm') {
            return 'Homepage';
        }

        if (path.indexOf('address') !== -1) {
            return 'Address page';
        }

        if (path.indexOf('contact') !== -1) {
            return 'Contact page';
        }

        return 'Website brochure CTA';
    }

    // ── Intercept every .btn--brochure click ─────────────────────────────────
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn--brochure');
        if (!btn) return;
        e.preventDefault();
        pendingHref     = BROCHURE_PDF;
        pendingFilename = btn.getAttribute('data-filename') || 'The-Address-Brochure.pdf';
        pendingSource   = getBrochureSource(btn);
        openModal();
    });

    // ── ESC closes modal ─────────────────────────────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    // ── Backdrop click closes modal ───────────────────────────────────────────
    document.addEventListener('click', function (e) {
        var modal = document.getElementById('brochure-modal');
        if (modal && !modal.hasAttribute('hidden') && e.target === modal) closeModal();
    });

    // ── Close button ─────────────────────────────────────────────────────────
    document.addEventListener('click', function (e) {
        if (e.target.closest('#brochure-modal-close')) closeModal();
    });

    // ── Form submit ───────────────────────────────────────────────────────────
    document.addEventListener('submit', function (e) {
        if (!e.target || e.target.id !== 'brochure-modal-form') return;
        e.preventDefault();
        submitLead();
    });

    // ─────────────────────────────────────────────────────────────────────────

    function openModal() {
        var modal = document.getElementById('brochure-modal');
        if (!modal) return;
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        var first = modal.querySelector('input');
        if (first) setTimeout(function () { first.focus(); }, 60);
    }

    function closeModal() {
        var modal = document.getElementById('brochure-modal');
        if (!modal) return;
        modal.setAttribute('hidden', '');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        var form = document.getElementById('brochure-modal-form');
        if (form) form.reset();
        pendingHref = null;
        pendingFilename = null;
        pendingSource = null;
        setStatus('', '');
        setSubmitting(false);
    }

    function getBrochureSource(btn) {
        if (btn.closest('.address-hero__actions')) return 'Address page hero';
        if (btn.closest('#apartments')) return 'Address page apartments section';
        if (btn.closest('#villas')) return 'Address page villas section';
        if (btn.closest('.address-project')) return 'Homepage Address section';

        return 'Website brochure CTA';
    }

    function setStatus(msg, type) {
        var el = document.getElementById('brochure-modal-status');
        if (!el) return;
        el.textContent = msg;
        el.className = 'brochure-modal__status' + (type ? ' brochure-modal__status--' + type : '');
    }

    function setSubmitting(busy) {
        var btn = document.getElementById('brochure-modal-submit');
        if (!btn) return;
        btn.disabled = busy;
        if (busy) {
            btn.innerHTML =
                '<span class="brochure-modal__spinner" aria-hidden="true"></span>Sending\u2026';
        } else {
            btn.innerHTML =
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>' +
                '<polyline points="7 10 12 15 17 10"/>' +
                '<line x1="12" y1="15" x2="12" y2="3"/></svg>' +
                'Get Brochure';
        }
    }

    function submitLead() {
        var form  = document.getElementById('brochure-modal-form');
        var name  = (form.querySelector('[name="bm-name"]').value  || '').trim();
        var email = (form.querySelector('[name="bm-email"]').value || '').trim();
        var phone = (form.querySelector('[name="bm-phone"]').value || '').trim();

        if (!name || name.length < 2) {
            setStatus('Please enter your name.', 'error'); return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setStatus('Please enter a valid email address.', 'error'); return;
        }
        if (phone.replace(/[\s\-\+\(\)]/g, '').length < 10) {
            setStatus('Please enter a valid phone number.', 'error'); return;
        }

        setSubmitting(true);
        setStatus('', '');

        function send(token) {
            var fd = new FormData();
            fd.append('name',    name);
            fd.append('email',   email);
            fd.append('phone',   phone);
            fd.append('interest', 'Brochure Download');
            fd.append('message', 'Requested brochure from ' + (pendingSource || 'website') + '.');
            fd.append('source', getSubmissionSource());
            fd.append('brochure_filename', pendingFilename || 'The-Address-Brochure.pdf');
            if (token) fd.append('g-recaptcha-response', token);

            fetch(FORM_ENDPOINT, { method: 'POST', body: fd })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data && data.success) {
                        setStatus('Thank you! Your download will begin shortly.', 'success');
                        triggerDownload();
                        setTimeout(closeModal, 2500);
                    } else {
                        setStatus('Something went wrong. Please try again.', 'error');
                        setSubmitting(false);
                    }
                })
                .catch(function () {
                    setStatus('Network error. Please try again.', 'error');
                    setSubmitting(false);
                });
        }

        // Use reCAPTCHA v3 if already loaded; load it on-demand otherwise
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.ready(function () {
                grecaptcha.execute(RECAPTCHA_KEY, { action: 'brochure' })
                    .then(function (token) { send(token); })
                    .catch(function () { send(''); });
            });
        } else {
            var s = document.createElement('script');
            s.src = 'https://www.google.com/recaptcha/api.js?render=' + RECAPTCHA_KEY;
            s.onload = function () {
                grecaptcha.ready(function () {
                    grecaptcha.execute(RECAPTCHA_KEY, { action: 'brochure' })
                        .then(function (token) { send(token); })
                        .catch(function () { send(''); });
                });
            };
            s.onerror = function () { send(''); };
            document.head.appendChild(s);
        }
    }

    function triggerDownload() {
        if (!pendingHref) return;
        var a = document.createElement('a');
        a.href     = pendingHref;
        a.download = pendingFilename || 'brochure.pdf';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            if (a.parentNode) a.parentNode.removeChild(a);
        }, 100);
    }
})();

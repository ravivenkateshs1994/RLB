(function () {
    const els = document.querySelectorAll('.contact-animate');
    if (!els.length) return;
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e, i) {
            if (e.isIntersecting) {
                setTimeout(function () { e.target.classList.add('is-visible'); }, i * 80);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
})();

(function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var submitBtn = document.getElementById('contact-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    function setFormStatus(msg, type) {
        var el = document.getElementById('form-status');
        if (!el) return;
        el.textContent = msg;
        el.className = 'form-status form-status--' + type;
        el.style.display = 'block';
        setTimeout(function () { el.style.display = 'none'; }, 6000);
    }

    function getFriendlySubmitError(err) {
        var fallback = 'We could not send your enquiry right now. Please try again in a moment or contact us directly.';
        var message = (err && err.message) ? String(err.message) : '';

        if (!message) return fallback;
        if (/Invalid server response|Endpoint response error|Failed to send email|reCAPTCHA verification error|reCAPTCHA suspicious|Server not configured/i.test(message)) {
            return fallback;
        }

        return message;
    }

    function clearFormStatus() {
        var el = document.getElementById('form-status');
        if (!el) return;
        el.textContent = '';
        el.className = 'form-status';
        el.style.display = 'none';
    }

    function getSubmissionSource() {
        if (typeof window.rlbGetSource === 'function') {
            try {
                return window.rlbGetSource() || 'Direct / unknown';
            } catch (err) {}
        }

        var fallback = 'Direct / unknown';
        var referrer = document.referrer || '';
        if (!referrer) return fallback;

        try {
            var referrerUrl = new URL(referrer);
            var path = (referrerUrl.pathname || '').replace(/^\/+/, '');

            if (referrerUrl.origin !== window.location.origin) {
                return 'External: ' + referrerUrl.hostname + (path ? ' / ' + path : '');
            }

            return 'Internal: ' + (path || 'Home') + (referrerUrl.hash || '');
        } catch (err) {
            return 'Referrer: ' + referrer;
        }
    }

    function reopenContactForm() {
        var sentEl = document.getElementById('contact-form-sent');
        if (sentEl) {
            sentEl.setAttribute('hidden', '');
        }

        form.classList.remove('is-sent');
        form.reset();
        clearFormStatus();
        disableForm(false);
        updateSubmitState();

        var firstField = form.querySelector('input, textarea, select');
        if (firstField && typeof firstField.focus === 'function') {
            firstField.focus();
        }

        if (typeof form.scrollIntoView === 'function') {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function disableForm(disabled) {
        if (!form) return;
        var controls = Array.from(form.querySelectorAll('input, textarea, select, button'));
        controls.forEach(function (c) {
            if (c === submitBtn) return;
            try { c.disabled = disabled; } catch (e) {}
        });
        if (submitBtn) submitBtn.disabled = disabled || !isFormValid();
        if (disabled) {
            form.classList.add('is-submitting');
            form.setAttribute('aria-busy', 'true');
        } else {
            form.classList.remove('is-submitting');
            form.removeAttribute('aria-busy');
        }
    }

    var siteKey = form.dataset.recaptchaSitekey;
    var formEndpoint = form.dataset.formEndpoint;

    function isFormValid() {
        var fd = new FormData(form);
        var name = (fd.get('name') || '').trim();
        var email = (fd.get('email') || '').trim();
        var phone = (fd.get('phone') || '').trim();

        if (!name || name.length < 2) return false;
        if (!/^\S+@\S+\.\S+$/.test(email)) return false;
        if (phone.replace(/[\s\-\+\(\)]/g, '').length < 10) return false;

        if (typeof widgetId !== 'undefined' && widgetId !== null) {
            try {
                var token = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse(widgetId) : '';
                if (!token) return false;
            } catch (err) {
                return false;
            }
        }

        var consentEl = form.querySelector('input[name="consent"]');
        if (consentEl && !consentEl.checked) return false;

        return true;
    }

    function updateSubmitState() {
        if (!submitBtn) return;
        try {
            submitBtn.disabled = !isFormValid();
        } catch (err) {
            submitBtn.disabled = false;
        }
    }

    Array.from(form.querySelectorAll('input, textarea, select')).forEach(function (el) {
        el.addEventListener('input', updateSubmitState);
        el.addEventListener('change', updateSubmitState);
    });

    var resetEnquiryLink = document.querySelector('[data-contact-form-reset]');
    if (resetEnquiryLink) {
        resetEnquiryLink.addEventListener('click', function (e) {
            e.preventDefault();
            reopenContactForm();
        });
    }

    setTimeout(updateSubmitState, 500);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var formEl = e.target;
        var formData = new FormData(formEl);
        var name = (formData.get('name') || '').trim();
        var email = (formData.get('email') || '').trim();
        var phone = (formData.get('phone') || '').trim();
        var message = (formData.get('message') || '').trim();

        var error = '';
        if (!name || name.length < 2) {
            error = 'Please enter your full name.';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            error = 'Please enter a valid email address.';
        } else if (phone.replace(/[\s\-\+\(\)]/g, '').length < 10) {
            error = 'Please enter a valid phone number (at least 10 digits).';
        }

        if (error) {
            setFormStatus(error, 'error');
            return;
        }

        formData.delete('consent');
        formData.set('source', getSubmissionSource());

        setFormStatus('Sending...', 'pending');
        disableForm(true);

        function sendWithOptionalRecaptcha(token) {
            if (token) formData.set('g-recaptcha-response', token);

            if (formEndpoint) {
                fetch(formEndpoint, {
                    method: 'POST',
                    body: formData
                })
                .then(function (res) {
                    return res.text().then(function (text) {
                        var data;
                        try {
                            data = text ? JSON.parse(text) : {};
                        } catch (err) {
                            throw new Error('We could not send your enquiry right now. Please try again in a moment or contact us directly.');
                        }

                        if (!res.ok || (data && data.success === false)) {
                            throw new Error((data && data.message) || 'We could not send your enquiry right now. Please try again in a moment or contact us directly.');
                        }

                        return data;
                    });
                })
                .then(function () {
                    formEl.reset();
                    var sentEl = document.getElementById('contact-form-sent');
                    if (sentEl) {
                        formEl.classList.add('is-sent');
                        sentEl.removeAttribute('hidden');
                        if (submitBtn) submitBtn.disabled = true;
                    } else {
                        setFormStatus('Thank you! Your message has been sent.', 'success');
                        disableForm(false);
                    }
                })
                .catch(function (err) {
                    setFormStatus(getFriendlySubmitError(err), 'error');
                    console.error('Endpoint submit error:', err);
                    disableForm(false);
                });

                return;
            }

            setFormStatus('No form endpoint configured. Set the `data-form-endpoint` attribute on the form to your server endpoint.', 'error');
            disableForm(false);
            return;
        }

        if (siteKey) {
            if (typeof grecaptcha === 'undefined') {
                var s = document.createElement('script');
                s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(siteKey);
                s.async = true;
                s.defer = true;
                s.onload = function () {
                    try {
                        grecaptcha.ready(function () {
                            grecaptcha.execute(siteKey, { action: 'contact' }).then(function (token) {
                                sendWithOptionalRecaptcha(token);
                            }).catch(function () { sendWithOptionalRecaptcha(); });
                        });
                    } catch (err) { sendWithOptionalRecaptcha(); }
                };
                document.head.appendChild(s);
            } else {
                try {
                    grecaptcha.ready(function () {
                        grecaptcha.execute(siteKey, { action: 'contact' }).then(function (token) {
                            sendWithOptionalRecaptcha(token);
                        }).catch(function () { sendWithOptionalRecaptcha(); });
                    });
                } catch (err) { sendWithOptionalRecaptcha(); }
            }
        } else {
            sendWithOptionalRecaptcha();
        }
    });
})();
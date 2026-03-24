// Hide WhatsApp FAB while the contact form is visible
(function () {
    var fab = document.getElementById('whatsapp-fab');
    var form = document.getElementById('contact-form');
    if (!fab || !form) return;
    var io = new IntersectionObserver(function (entries) {
        fab.classList.toggle('fab--hidden', entries[0].isIntersecting);
    }, { threshold: 0.1 });
    io.observe(form);
})();

// Scroll-in animation for .contact-animate elements
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

// Form submission feedback via hidden iframe load detection
(function () {
    var form = document.getElementById('contact-form');
    var iframe = document.getElementById('web3forms-iframe');
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('contact-submit-btn');
    if (!form || !iframe || !statusEl || !submitBtn) return;

    var submitted = false;
    var originalBtnHTML = submitBtn.innerHTML;

    form.addEventListener('submit', function () {
        submitted = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    });

    iframe.addEventListener('load', function () {
        if (!submitted) return;
        submitted = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        statusEl.textContent = '\u2713 Message received — we’ll be in touch within one business day.';
        var sentEl = document.getElementById('contact-form-sent');
        form.classList.add('is-sent');
        statusEl.className = 'form-status';
        statusEl.textContent = '';
        if (sentEl) sentEl.removeAttribute('hidden');
    });
})();

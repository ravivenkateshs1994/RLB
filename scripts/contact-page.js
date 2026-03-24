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
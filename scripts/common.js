// Shared behaviours across pages

document.addEventListener('DOMContentLoaded', () => {
        // Dynamically populate country code dropdown using restcountries.com
        const countryCodeSelect = document.getElementById('country-code');
        if (countryCodeSelect && countryCodeSelect.tagName === 'SELECT') {
            fetch('https://restcountries.com/v3.1/all?fields=name,idd')
                .then(res => res.json())
                .then(data => {
                    // Sort countries by name
                    data.sort((a, b) => (a.name.common > b.name.common ? 1 : -1));
                    countryCodeSelect.innerHTML = '';
                    data.forEach(country => {
                        if (country.idd && country.idd.root && Array.isArray(country.idd.suffixes) && country.idd.suffixes.length > 0) {
                            country.idd.suffixes.forEach(suffix => {
                                const code = `${country.idd.root}${suffix}`;
                                // Remove non-numeric for value, keep + for display
                                const value = code.replace(/[^\d]/g, '');
                                const option = document.createElement('option');
                                option.value = value;
                                option.textContent = `${code} (${country.name.common})`;
                                if (value === '91') option.selected = true; // Default to India
                                countryCodeSelect.appendChild(option);
                            });
                        }
                    });
                })
                .catch(() => {
                    // fallback: just show India if fetch fails
                    countryCodeSelect.innerHTML = '<option value="91" selected>+91 (India)</option>';
                });
        }
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const linkMap = {};
    navLinks.forEach(link => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;
        const id = hash.slice(1);
        linkMap[id] = link;
    });

    if (Object.keys(linkMap).length && sections.length) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    const id = entry.target.id;
                    const link = linkMap[id];
                    if (!link) return;

                    if (entry.isIntersecting) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            },
            {
                root: null,
                threshold: 0.4
            }
        );

        sections.forEach(section => observer.observe(section));
    }

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    let lastFocusedBeforeMobileNav = null;

    function openMobileNav() {
        if (!mobileNav || !backdrop || !mobileBtn) return;
        lastFocusedBeforeMobileNav = document.activeElement;
        mobileNav.classList.add('open');
        backdrop.classList.add('open');
        mobileBtn.classList.add('is-open');
        mobileBtn.setAttribute('aria-expanded', 'true');
        mobileBtn.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden';

        const focusable = mobileNav.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) {
            focusable[0].focus();
        }
    }

    function closeMobileNav() {
        if (!mobileNav || !backdrop || !mobileBtn) return;
        mobileNav.classList.remove('open');
        backdrop.classList.remove('open');
        mobileBtn.classList.remove('is-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
        if (lastFocusedBeforeMobileNav && typeof lastFocusedBeforeMobileNav.focus === 'function') {
            lastFocusedBeforeMobileNav.focus();
        }
    }

    function toggleMobileNav() {
        if (!mobileNav) return;
        if (mobileNav.classList.contains('open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    if (mobileBtn && mobileNav && backdrop) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });

        mobileNav.addEventListener('click', (e) => {
            const link = e.target.closest('.mobile-nav__link');
            if (!link) return;

            const href = link.getAttribute('href');
            closeMobileNav();

            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href);
            }
        });

        backdrop.addEventListener('click', closeMobileNav);

        document.addEventListener('click', (e) => {
            if (!mobileNav.classList.contains('open')) return;
            if (mobileNav.contains(e.target) || mobileBtn.contains(e.target)) return;
            closeMobileNav();
        });

        document.addEventListener('keydown', (e) => {
            if (mobileNav.classList.contains('open') && e.key === 'Escape') {
                closeMobileNav();
                return;
            }

            if (!mobileNav.classList.contains('open') || e.key !== 'Tab') return;

            const focusable = Array.from(
                mobileNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
            );
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const current = document.activeElement;

            if (e.shiftKey) {
                if (current === first || !focusable.includes(current)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (current === last || !focusable.includes(current)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
});

function scrollToSection(targetId) {
    const id = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    const targetElement = document.getElementById(id);
    if (!targetElement) return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 80;
    const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
        top: offsetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
}

document.querySelectorAll('.nav__link, .contact-btn, .btn--primary').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            scrollToSection(href);

            document.querySelectorAll('.nav__link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            if (link.classList.contains('nav__link')) {
                link.classList.add('active');
            }
        }
    });
});

const scrollToTopBtn = document.getElementById('scroll-to-top');
if (scrollToTopBtn) {
    const SCROLL_TO_TOP_THRESHOLD = 500;
    let scrollToTopTicking = false;

    function handleScrollToTopBtn() {
        if (window.scrollY > SCROLL_TO_TOP_THRESHOLD) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
        scrollToTopTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollToTopTicking) {
            scrollToTopTicking = true;
            window.requestAnimationFrame(handleScrollToTopBtn);
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        const prefersReducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
}

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const newObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            newObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => newObserver.observe(el));

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent email sending
        // WhatsApp message (open in new tab)
            const form = e.target;
            const formData = new FormData(form);
            const name = formData.get('name') ? formData.get('name').trim() : '';
            const email = formData.get('email') ? formData.get('email').trim() : '';
            const phone = formData.get('phone') ? formData.get('phone').trim() : '';
            const countryCode = formData.get('country-code') ? formData.get('country-code').replace(/[^\d]/g, '').trim() : '';
            const message = formData.get('message') || '';

            // Basic validation
            let error = '';
            if (!name || name.length < 2) {
                error = 'Please enter your full name.';
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                error = 'Please enter a valid email address.';
            } else if (!countryCode || !/^\d{1,4}$/.test(countryCode)) {
                error = 'Please enter a valid country code.';
            } else if (!/^\d{4,15}$/.test(phone.replace(/\s|\-/g, ''))) {
                error = 'Please enter a valid phone number.';
            }
            if (error) {
                let notification = document.getElementById('form-notification');
                if (!notification) {
                    notification = document.createElement('div');
                    notification.id = 'form-notification';
                    notification.setAttribute('role', 'status');
                    notification.setAttribute('aria-live', 'polite');
                    notification.className = 'notification';
                    contactForm.parentNode.insertBefore(notification, contactForm);
                }
                notification.textContent = error;
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    notification.textContent = '';
                }, 4000);
                return;
            }

            const waNumber = '919876543210'; // Replace with your WhatsApp number (with country code, no +)
            const fullPhone = countryCode ? `+${countryCode}${phone}` : phone;
            const waMsg =
                `Hi Rich Land Builders,\n` +
                `I'm ${name} and I came across your website. I'm interested in learning more about your homes.\n` +
                `Here are my details:\n` +
                `Email: ${email}\n` +
                `Phone: ${fullPhone}\n` +
                (message ? `A little about what I'm looking for: ${message}` : '');
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;
            window.open(waUrl, '_blank');
            form.reset();
    });
}

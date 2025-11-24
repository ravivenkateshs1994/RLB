document.addEventListener('DOMContentLoaded', () => {
    // Carousel functionality
    class Carousel {
        constructor() {
            this.currentSlide = 0;
            this.slides = document.querySelectorAll('.carousel__slide');
            this.dots = document.querySelectorAll('.carousel__dot');
            this.prevBtn = document.querySelector('.carousel__arrow--prev');
            this.nextBtn = document.querySelector('.carousel__arrow--next');
            this.autoPlayInterval = null;
            this.isPaused = false;

            this.init();
        }

        init() {
            // Dot navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });

            // Arrow navigation
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                const active = document.activeElement;
                const isEditable = active && (
                    active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable
                );
                if (isEditable) return;
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });

            // Pause on hover
            const carousel = document.querySelector('.carousel');
            if (carousel) {
                carousel.addEventListener('mouseenter', () => this.pause());
                carousel.addEventListener('mouseleave', () => this.resume());
            }

            // Touch support
            this.initTouchSupport();

            // Start autoplay
            this.startAutoPlay();
        }

        goToSlide(index) {
            this.slides[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide].classList.remove('active');

            this.currentSlide = index;

            this.slides[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide].classList.add('active');
        }

        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(next);
        }

        prevSlide() {
            const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prev);
        }

        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.nextSlide();
                }
            }, 5000); // Change slide every 5 seconds
        }

        pause() {
            this.isPaused = true;
        }

        resume() {
            this.isPaused = false;
        }

        initTouchSupport() {
            let touchStartX = 0;
            let touchEndX = 0;
            const carousel = document.querySelector('.carousel');

            if (!carousel) return;

            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }

        handleSwipe(touchStartX, touchEndX) {
            if (touchEndX < touchStartX - 50) {
                this.nextSlide();
            } else if (touchEndX > touchStartX + 50) {
                this.prevSlide();
            }
        }
    }

    // Initialize carousel
    const carousel = new Carousel();

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!sections.length || !navLinks.length) return;

    const linkMap = {};
    navLinks.forEach(link => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;
        const id = hash.slice(1);
        linkMap[id] = link;
    });

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = linkMap[id];
                if (!link) return;

                if (entry.isIntersecting) {
                    // remove active from all
                    navLinks.forEach(l => l.classList.remove('active'));
                    // set active on current
                    link.classList.add('active');
                }
            });
        },
        {
            root: null,
            threshold: 0.4 // section is active when 40% visible
        }
    );

    sections.forEach(section => observer.observe(section));

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (!mobileBtn || !mobileNav || !backdrop) return;

    function openMobileNav() {
        mobileNav.classList.add('open');
        backdrop.classList.add('open');
        mobileBtn.classList.add('is-open');
        mobileBtn.setAttribute('aria-expanded', 'true');
        mobileBtn.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        mobileNav.classList.remove('open');
        backdrop.classList.remove('open');
        mobileBtn.classList.remove('is-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
    }

    function toggleMobileNav() {
        if (mobileNav.classList.contains('open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileNav();
    });

    // Close on link click + smooth scroll
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

    // Close when clicking on backdrop
    backdrop.addEventListener('click', closeMobileNav);

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!mobileNav.classList.contains('open')) return;
        if (mobileNav.contains(e.target) || mobileBtn.contains(e.target)) return;
        closeMobileNav();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
            closeMobileNav();
        }
    });

});



// Smooth scroll functionality
function scrollToSection(targetId) {
    const id = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    const targetElement = document.getElementById(id);
    if (!targetElement) return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 80;
    const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

// Navigation links
document.querySelectorAll('.nav__link, .contact-btn, .btn--primary').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            scrollToSection(href);

            // Update active state
            document.querySelectorAll('.nav__link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            if (link.classList.contains('nav__link')) {
                link.classList.add('active');
            }
        }
    });
});

// Scroll-to-top button logic
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
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
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Intersection Observer for fade-in animations
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

// Observe elements with class .fade-in (adjust selector as needed)
document.querySelectorAll('.fade-in').forEach(el => newObserver.observe(el));

// Contact form submission (accessible simulated submission)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.btn--submit');
        if (!submitBtn) return;
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            let notification = document.getElementById('form-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'form-notification';
                notification.setAttribute('role', 'status');
                notification.setAttribute('aria-live', 'polite');
                notification.className = 'notification';
                contactForm.parentNode.insertBefore(notification, contactForm);
            }
            notification.textContent = 'Thank you for your message! We will get back to you within 24 hours.';
            notification.style.display = 'block';
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            setTimeout(() => {
                notification.style.display = 'none';
                notification.textContent = '';
            }, 5000);
        }, 1500);
    });
}


// Contact form submission with Web3Forms
/*document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form || !submitBtn || !statusEl) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic front‑end validation
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !phone || !message) {
            statusEl.textContent = 'Please fill in all the fields before submitting.';
            statusEl.style.color = '#ffdddd';
            return;
        }

        statusEl.style.color = '#ffe8be';
        statusEl.textContent = 'Sending your message…';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        const formData = new FormData(form);

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                statusEl.style.color = '#c9ffd2';
                statusEl.textContent = 'Thank you. We’ve received your message and will get back to you shortly.';
                form.reset();

                // Open WhatsApp on mobile (optional)
                const isMobile = /android|iphone|ipad|ipod|windows phone/i.test(
                    navigator.userAgent
                );
                if (isMobile) {
                    const waNumber = '919876543210'; // change to your number
                    const waText = encodeURIComponent(
                        `Hi, this is ${name}.\n` +
                        `I just submitted an enquiry on your website.\n\n` +
                        `Phone: ${phone}\n\n` +
                        `Here’s a quick summary of my message:\n${message}`
                    );
                    window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
                }
            } else {
                statusEl.style.color = '#ffdddd';
                statusEl.textContent =
                    'Something went wrong while sending your message. Please try again in a moment.';
                console.error('Web3Forms error:', data);
            }
        } catch (err) {
            console.error(err);
            statusEl.style.color = '#ffdddd';
            statusEl.textContent =
                'We couldn’t reach the server. Please check your connection and try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });
});*/

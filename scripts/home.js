/* ===========================================
   HOME.JS - HOME PAGE SPECIFIC FUNCTIONALITY
   =========================================== */

/* ===========================================
   DOM CONTENT LOADED - MAIN INITIALIZATION
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeHeroCarousel();

    // Scroll hint chevron
    const scrollHint = document.getElementById('hero-scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            const target = document.getElementById('about');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});

/* ===========================================
   HERO CAROUSEL INITIALIZATION
   =========================================== */

function initializeHeroCarousel() {
    const hasCarousel = document.querySelectorAll('.carousel__slide').length > 0;
    if (hasCarousel) {
        new Carousel();
    }
}

/* ===========================================
   CAROUSEL CLASS DEFINITION
   =========================================== */

class Carousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel__slide');
        this.dots = document.querySelectorAll('.carousel__dot');
        this.prevBtn = document.querySelector('.carousel__arrow--prev');
        this.nextBtn = document.querySelector('.carousel__arrow--next');
        this.autoPlayInterval = null;
        this.isPaused = false;

        if (!this.slides.length) return;
        this.init();
    }

    /* ===========================================
       CAROUSEL INITIALIZATION
       =========================================== */

    init() {
        this.setupEventListeners();
        this.setupKeyboardSupport();
        this.setupHoverBehavior();
        this.initTouchSupport();
        this.startAutoPlay();
    }

    /* ===========================================
       EVENT LISTENERS SETUP
       =========================================== */

    setupEventListeners() {
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Arrow navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }

    /* ===========================================
       KEYBOARD SUPPORT
       =========================================== */

    setupKeyboardSupport() {
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
    }

    /* ===========================================
       HOVER BEHAVIOR
       =========================================== */

    setupHoverBehavior() {
        const carousel = document.querySelector('.carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.pause());
            carousel.addEventListener('mouseleave', () => this.resume());
        }
    }

    /* ===========================================
       SLIDE NAVIGATION METHODS
       =========================================== */

    goToSlide(index) {
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        this.currentSlide = index;
        const newSlide = this.slides[this.currentSlide];

        newSlide.classList.add('active');
        this.dots[this.currentSlide].classList.add('active');

        // Force CSS animation restart (fixes mobile/tablet WebKit not re-triggering @keyframes)
        const animated = Array.from(newSlide.querySelectorAll(
            '.carousel__img-wrap, .carousel__badge, .carousel__title, .carousel__subtitle, .carousel__description, .carousel__actions'
        ));
        animated.forEach(el => { el.style.animation = 'none'; });
        void newSlide.offsetWidth; // single reflow flushes all at once
        animated.forEach(el => { el.style.animation = ''; });
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prev);
    }

    /* ===========================================
       AUTOPLAY FUNCTIONALITY
       =========================================== */

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, 7500);
    }

    resume() {
        this.isPaused = false;
    }

    pause() {
        this.isPaused = true;
    }

    /* ===========================================
       TOUCH / SWIPE SUPPORT
       =========================================== */

    initTouchSupport() {
        const track = document.querySelector('.carousel__track');
        if (!track) return;

        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
            isDragging = false;
        }, { passive: true });
    }
}

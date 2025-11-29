/* ===========================================
   HOME.JS - HOME PAGE SPECIFIC FUNCTIONALITY
   =========================================== */

/* ===========================================
   DOM CONTENT LOADED - MAIN INITIALIZATION
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeHeroCarousel();
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

    /* ===========================================
       AUTOPLAY FUNCTIONALITY
       =========================================== */

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, 5000);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    /* ===========================================
       TOUCH/SWIPE SUPPORT
       =========================================== */

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

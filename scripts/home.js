// Home page specific: hero carousel

document.addEventListener('DOMContentLoaded', () => {
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

        init() {
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });

            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextSlide());
            }

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

            const carousel = document.querySelector('.carousel');
            if (carousel) {
                carousel.addEventListener('mouseenter', () => this.pause());
                carousel.addEventListener('mouseleave', () => this.resume());
            }

            this.initTouchSupport();
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
            }, 5000);
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

    const hasCarousel = document.querySelectorAll('.carousel__slide').length > 0;
    if (hasCarousel) {
        new Carousel();
    }
});

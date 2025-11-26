// Address page specific: tabs, galleries, floorplans, specs accordions

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.address-tab');
    const tabPanels = document.querySelectorAll('.address-tabs__panel');

    const galleryControllers = new Map();

    document.querySelectorAll('.address-gallery--with-main').forEach(gallery => {
        const mainImg = gallery.querySelector('.address-gallery__main-image');
        const thumbs = Array.from(gallery.querySelectorAll('.address-gallery__thumb'));
        if (!mainImg || !thumbs.length) return;

        let currentIndex = thumbs.findIndex(t => t.classList.contains('is-active'));
        if (currentIndex < 0) currentIndex = 0;
        let slideTimer = null;
        const SLIDE_INTERVAL = 6000;

        const showSlide = (index) => {
            const thumb = thumbs[index];
            const largeSrc = thumb.getAttribute('data-large-src');
            if (!largeSrc || mainImg.src === largeSrc) return;

            thumbs.forEach(t => t.classList.remove('is-active'));
            thumb.classList.add('is-active');

            mainImg.classList.remove('is-fading');
            mainImg.offsetHeight;
            mainImg.classList.add('is-fading');

            const handleTransitionEnd = () => {
                mainImg.removeEventListener('transitionend', wrappedHandler);
                mainImg.src = largeSrc;
                requestAnimationFrame(() => {
                    mainImg.classList.remove('is-fading');
                });
            };

            const fallbackTimeout = setTimeout(() => {
                mainImg.removeEventListener('transitionend', wrappedHandler);
                mainImg.src = largeSrc;
                mainImg.classList.remove('is-fading');
            }, 400);

            const wrappedHandler = (e) => {
                clearTimeout(fallbackTimeout);
                handleTransitionEnd(e);
            };

            mainImg.addEventListener('transitionend', wrappedHandler);
        };

        const startSlideshow = () => {
            if (slideTimer) clearInterval(slideTimer);
            slideTimer = setInterval(() => {
                currentIndex = (currentIndex + 1) % thumbs.length;
                showSlide(currentIndex);
            }, SLIDE_INTERVAL);
        };

        const stopSlideshow = () => {
            if (slideTimer) {
                clearInterval(slideTimer);
                slideTimer = null;
            }
        };

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentIndex = index;
                showSlide(currentIndex);
                startSlideshow();
            });
        });

        const parentPanel = gallery.closest('.address-tabs__panel');
        const isInActivePanel = !parentPanel || parentPanel.classList.contains('address-tabs__panel--active');
        if (isInActivePanel) {
            startSlideshow();
        }

        galleryControllers.set(gallery, {
            start: startSlideshow,
            stop: stopSlideshow,
            resetToFirst: () => {
                currentIndex = 0;
                mainImg.classList.remove('is-fading');
                const firstThumb = thumbs[currentIndex];
                const firstSrc = firstThumb && firstThumb.getAttribute('data-large-src');
                if (!firstSrc) return;

                thumbs.forEach(t => t.classList.remove('is-active'));
                firstThumb.classList.add('is-active');
                mainImg.src = firstSrc;
            }
        });
    });

    if (tabButtons.length && tabPanels.length) {
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');
                if (!target) return;

                tabButtons.forEach(b => b.classList.remove('address-tab--active'));
                tabPanels.forEach(p => {
                    p.classList.remove('address-tabs__panel--active');
                    p.querySelectorAll('.address-gallery--with-main').forEach(gal => {
                        const controller = galleryControllers.get(gal);
                        if (controller) controller.stop();
                    });
                });

                btn.classList.add('address-tab--active');
                const panel = document.getElementById(`tab-${target}`);
                if (panel) {
                    panel.classList.add('address-tabs__panel--active');

                    panel.querySelectorAll('.address-gallery--with-main').forEach(gal => {
                        const controller = galleryControllers.get(gal);
                        if (controller) {
                            controller.resetToFirst();
                            controller.start();
                        }
                    });
                }
            });
        });
    }

    document.querySelectorAll('.address-floorplan').forEach(fp => {
        const mainImg = fp.querySelector('.address-floorplan__main-image');
        const thumbs = fp.querySelectorAll('.address-floorplan__thumb');
        if (!mainImg || !thumbs.length) return;

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const largeSrc = thumb.getAttribute('data-large-src');
                if (!largeSrc || mainImg.src === largeSrc) return;

                thumbs.forEach(t => t.classList.remove('is-active'));
                thumb.classList.add('is-active');
                mainImg.src = largeSrc;
            });
        });
    });

    document.querySelectorAll('.address-specs').forEach(specsBlock => {
        const groups = Array.from(specsBlock.querySelectorAll('.address-specs__group'));

        groups.forEach(group => {
            group.addEventListener('click', (event) => {
                // Make the whole card clickable, but avoid double-toggles from nested links/buttons
                const target = event.target;
                if (target.closest('a, button')) return;

                const isOpen = group.classList.contains('is-open');

                // Close others for a calm, single-open interaction
                groups.forEach(g => g.classList.remove('is-open'));

                if (!isOpen) {
                    group.classList.add('is-open');
                }
            });
        });
    });
});

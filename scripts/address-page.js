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
        const activateTab = (btn) => {
            const target = btn.getAttribute('data-tab');
            if (!target) return;

            tabButtons.forEach(b => {
                const isActive = b === btn;
                b.classList.toggle('address-tab--active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                b.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            tabPanels.forEach(p => {
                const matches = p.id === `tab-${target}`;
                p.classList.toggle('address-tabs__panel--active', matches);
                if (matches) {
                    p.removeAttribute('hidden');
                } else {
                    p.setAttribute('hidden', 'hidden');
                }

                p.querySelectorAll('.address-gallery--with-main').forEach(gal => {
                    const controller = galleryControllers.get(gal);
                    if (!controller) return;
                    if (matches) {
                        controller.resetToFirst();
                        controller.start();
                    } else {
                        controller.stop();
                    }
                });
            });
        };

        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                activateTab(btn);
            });

            btn.addEventListener('keydown', (event) => {
                const currentIndex = Array.prototype.indexOf.call(tabButtons, btn);
                let nextIndex = currentIndex;

                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    nextIndex = (currentIndex + 1) % tabButtons.length;
                } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                } else if (event.key === 'Home') {
                    event.preventDefault();
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    event.preventDefault();
                    nextIndex = tabButtons.length - 1;
                } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateTab(btn);
                    return;
                } else {
                    return;
                }

                const nextBtn = tabButtons[nextIndex];
                if (nextBtn) {
                    nextBtn.focus();
                    activateTab(nextBtn);
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

        groups.forEach((group, index) => {
            const header = group.querySelector('.address-specs__group-header');
            const body = group.querySelector('.address-specs__body');
            if (!header || !body) return;

            const panelId = body.id || `address-specs-panel-${index}`;
            body.id = panelId;

            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            header.setAttribute('aria-controls', panelId);
            header.setAttribute('aria-expanded', group.classList.contains('is-open') ? 'true' : 'false');

            const toggleGroup = () => {
                const isOpen = group.classList.contains('is-open');

                groups.forEach(g => {
                    g.classList.remove('is-open');
                    const h = g.querySelector('.address-specs__group-header');
                    const b = g.querySelector('.address-specs__body');
                    if (h && b) {
                        h.setAttribute('aria-expanded', 'false');
                        b.setAttribute('hidden', 'hidden');
                    }
                });

                if (!isOpen) {
                    group.classList.add('is-open');
                    header.setAttribute('aria-expanded', 'true');
                    body.removeAttribute('hidden');
                }
            };

            header.addEventListener('click', (event) => {
                if (event.target.closest('a, button')) return;
                toggleGroup();
            });

            header.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleGroup();
                }
            });
        });
    });

    // Auto-highlight amenities in sequence for both villas and apartments
    const AMENITY_INTERVAL = 2600;
    const ACTIVE_CLASS = 'is-active';

    document.querySelectorAll('.address-amenities').forEach(grid => {
        const tiles = Array.from(grid.querySelectorAll('.amenity-tile'));
        if (!tiles.length) return;

        let index = 0;

        const step = () => {
            // If user is hovering any amenity in this grid, respect that
            if (tiles.some(t => t.matches(':hover'))) return;

            tiles.forEach(t => t.classList.remove(ACTIVE_CLASS));
            tiles[index].classList.add(ACTIVE_CLASS);

            index = (index + 1) % tiles.length;
        };

        // Start with the first tile active
        tiles[0].classList.add(ACTIVE_CLASS);

        setInterval(step, AMENITY_INTERVAL);
    });

    // Image lightbox for gallery and floorplan images
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('image-lightbox-image');
    const lightboxBackdrop = document.getElementById('image-lightbox-backdrop');
    const lightboxThumbs = document.getElementById('image-lightbox-thumbs');
    const lightboxMeta = document.getElementById('image-lightbox-meta');
    const lightboxPrev = document.getElementById('image-lightbox-prev');
    const lightboxNext = document.getElementById('image-lightbox-next');
    const lightboxClose = document.getElementById('image-lightbox-close');

    if (lightbox && lightboxImage && lightboxBackdrop && lightboxThumbs && lightboxMeta && lightboxPrev && lightboxNext && lightboxClose) {
        let currentThumbGroup = [];
        let currentIndex = 0;

        const updateMeta = () => {
            if (!currentThumbGroup.length) {
                lightboxMeta.textContent = '';
                return;
            }
            const total = currentThumbGroup.length;
            const displayIndex = currentIndex + 1;
            lightboxMeta.textContent = `${displayIndex} / ${total}`;

            lightboxPrev.disabled = total <= 1;
            lightboxNext.disabled = total <= 1;
        };

        const setActiveThumb = (index) => {
            currentThumbGroup.forEach((thumb, i) => {
                if (i === index) {
                    thumb.classList.add('image-lightbox__thumb--active');
                    const target = thumb;
                    const container = lightboxThumbs;
                    const offsetLeft = target.offsetLeft;
                    const targetWidth = target.offsetWidth;
                    const containerWidth = container.clientWidth;
                    const desiredScrollLeft = offsetLeft - (containerWidth - targetWidth) / 2;
                    container.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
                } else {
                    thumb.classList.remove('image-lightbox__thumb--active');
                }
            });
            currentIndex = index;
            updateMeta();
        };

        const showByIndex = (index) => {
            if (!currentThumbGroup.length) return;
            const total = currentThumbGroup.length;
            const wrappedIndex = ((index % total) + total) % total;
            const thumb = currentThumbGroup[wrappedIndex];
            const largeSrc = thumb.getAttribute('data-large-src');
            const thumbImg = thumb.querySelector('img');
            const thumbAlt = thumbImg && thumbImg.alt;

            if (largeSrc) {
                lightboxImage.src = largeSrc;
                if (thumbAlt) {
                    lightboxImage.alt = thumbAlt;
                }
            }
            setActiveThumb(wrappedIndex);
        };

        let lastFocusedElement = null;

        const getLightboxFocusable = () => {
            return lightbox.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
        };

        const handleLightboxKeydown = (event) => {
            if (event.key === 'Tab') {
                const focusable = Array.from(getLightboxFocusable());
                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const current = document.activeElement;

                if (event.shiftKey) {
                    if (current === first || !focusable.includes(current)) {
                        event.preventDefault();
                        last.focus();
                    }
                } else {
                    if (current === last || !focusable.includes(current)) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        const openLightbox = (src, alt, thumbSources) => {
            lightboxImage.src = src;
            lightboxImage.alt = alt || 'Expanded view';

            lightboxThumbs.innerHTML = '';
            currentThumbGroup = [];
            currentIndex = 0;

            thumbSources.forEach(({ largeSrc, thumbSrc, thumbAlt }, index) => {
                const wrapper = document.createElement('button');
                wrapper.type = 'button';
                wrapper.className = 'image-lightbox__thumb';
                wrapper.setAttribute('data-large-src', largeSrc);

                const img = document.createElement('img');
                img.src = thumbSrc || largeSrc;
                if (thumbAlt) img.alt = thumbAlt;

                wrapper.appendChild(img);
                lightboxThumbs.appendChild(wrapper);
                currentThumbGroup.push(wrapper);

                wrapper.addEventListener('click', () => {
                    showByIndex(index);
                });
            });

            const initialIndex = thumbSources.findIndex(({ largeSrc }) => largeSrc === src);
            if (initialIndex >= 0) {
                showByIndex(initialIndex);
            } else {
                setActiveThumb(0);
            }

            lastFocusedElement = document.activeElement;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            lightboxClose.focus();
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleLightboxKeydown, true);
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            lightboxImage.src = '';
            lightboxThumbs.innerHTML = '';
            currentThumbGroup = [];
            currentIndex = 0;
            lightboxMeta.textContent = '';
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleLightboxKeydown, true);
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        };

        lightboxBackdrop.addEventListener('click', closeLightbox);
        lightboxClose.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (event) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowLeft') {
                showByIndex(currentIndex - 1);
            } else if (event.key === 'ArrowRight') {
                showByIndex(currentIndex + 1);
            }
        });

        lightboxPrev.addEventListener('click', () => {
            showByIndex(currentIndex - 1);
        });

        lightboxNext.addEventListener('click', () => {
            showByIndex(currentIndex + 1);
        });

        document
            .querySelectorAll('.address-gallery__main-image')
            .forEach((img) => {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', () => {
                    const gallery = img.closest('.address-gallery--with-main');
                    const thumbs = gallery
                        ? Array.from(gallery.querySelectorAll('.address-gallery__thumb'))
                        : [];

                    const thumbSources = thumbs.map((thumb) => {
                        const largeSrc = thumb.getAttribute('data-large-src');
                        const thumbImg = thumb.querySelector('img');
                        return {
                            largeSrc: largeSrc || (thumbImg && thumbImg.src) || img.src,
                            thumbSrc: thumbImg && thumbImg.src,
                            thumbAlt: thumbImg && thumbImg.alt,
                        };
                    });

                    const src = img.getAttribute('src');
                    const alt = img.getAttribute('alt');
                    if (src) {
                        openLightbox(src, alt, thumbSources);
                    }
                });
            });

        document
            .querySelectorAll('.address-floorplan__main-image')
            .forEach((img) => {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', () => {
                    const floorplan = img.closest('.address-floorplan');
                    const thumbs = floorplan
                        ? Array.from(floorplan.querySelectorAll('.address-floorplan__thumb'))
                        : [];

                    const thumbSources = thumbs.map((thumb) => {
                        const largeSrc = thumb.getAttribute('data-large-src');
                        const thumbImg = thumb.querySelector('img');
                        return {
                            largeSrc: largeSrc || (thumbImg && thumbImg.src) || img.src,
                            thumbSrc: thumbImg && thumbImg.src,
                            thumbAlt: thumbImg && thumbImg.alt,
                        };
                    });

                    const src = img.getAttribute('src');
                    const alt = img.getAttribute('alt');
                    if (src) {
                        openLightbox(src, alt, thumbSources);
                    }
                });
            });
    }
});

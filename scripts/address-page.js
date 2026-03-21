/**
 * Address Page JavaScript
 * Handles UI interactions for floorplans, galleries, tabs, accordions, and lightbox functionality.
 */

// ====================
// CONSTANTS AND UTILITIES
// ====================

const AMENITY_INTERVAL = 2600;
const ACTIVE_CLASS = 'is-active';
const SWIPE_THRESHOLD = 40;

// ====================
// GLIGHTBOX IMAGE VIEWER HELPER
// ====================

function openGLightbox(items, startIndex, onClose) {
    if (typeof GLightbox === 'undefined') return;
    let currentSlideIndex = startIndex;
    const lb = GLightbox({
        elements: items.map(item => ({
            href: item.src,
            type: 'image',
            alt: item.alt || '',
        })),
        startAt: startIndex,
        touchNavigation: true,
        touchFollowAxis: true,
        keyboardNavigation: true,
        closeOnOutsideClick: true,
        loop: true,
        zoomable: true,
        draggable: true,
        dragAutoSnap: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'slide',
        descPosition: 'bottom',
        skin: 'clean',
    });
    lb.on('slide_changed', ({ current }) => {
        if (current && typeof current.index === 'number') {
            currentSlideIndex = current.index;
        }
    });
    lb.on('close', () => {
        if (typeof onClose === 'function') onClose(currentSlideIndex);
        lb.destroy();
    });
    lb.open();
}

// ====================
// FLOORPLAN ACCORDION (MOBILE) IMAGE VIEWER
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-accordion__panel img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.title = 'Click to view full size';
        img.addEventListener('click', function () {
            openGLightbox([{ src: img.src, alt: img.alt }], 0);
        });
    });
});

// ====================
// FLOORPLAN ACCORDION (MOBILE) LOGIC
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-accordion--mobile').forEach(function (accordion) {
        const items = accordion.querySelectorAll('.floorplan-accordion__item');

        items.forEach(function (item) {
            const header = item.querySelector('.floorplan-accordion__header');
            const panel = item.querySelector('.floorplan-accordion__panel');
            header.setAttribute('aria-expanded', 'false');

            header.addEventListener('click', function () {
                // Close all other panels
                items.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        const otherHeader = otherItem.querySelector('.floorplan-accordion__header');
                        otherHeader.classList.remove('active');
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherItem.querySelector('.floorplan-accordion__panel').style.display = 'none';
                    }
                });

                // Toggle this panel
                const isActive = header.classList.contains('active');
                if (isActive) {
                    header.classList.remove('active');
                    header.setAttribute('aria-expanded', 'false');
                    panel.style.display = 'none';
                } else {
                    header.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    panel.style.display = 'block';
                }
            });
        });

        // Open the first panel by default
        if (items.length > 0) {
            const firstHeader = items[0].querySelector('.floorplan-accordion__header');
            firstHeader.classList.add('active');
            firstHeader.setAttribute('aria-expanded', 'true');
            items[0].querySelector('.floorplan-accordion__panel').style.display = 'block';
        }
    });
});

// ====================
// FLOORPLAN TAB IMAGES VIEWER
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-tabs--desktop').forEach(tabContainer => {
        const images = Array.from(tabContainer.querySelectorAll('.floorplan-tabs__image'));
        images.forEach((img, idx) => {
            img.style.cursor = 'zoom-in';
            img.title = 'Click to view full size';
            img.addEventListener('click', function () {
                const items = images.map(i => ({
                    src: i.getAttribute('src'),
                    alt: i.alt,
                }));
                openGLightbox(items, idx);
            });
        });
    });
});

// ====================
// TABBED FLOORPLAN LOGIC
// ====================

document.addEventListener('DOMContentLoaded', function () {
    // Handle each floorplan tab section separately
    document.querySelectorAll('.floorplan-tabs').forEach(tabContainer => {
        const tabButtons = tabContainer.querySelectorAll('.floorplan-tabs__button');
        const images = tabContainer.querySelectorAll('.floorplan-tabs__image');

        tabButtons.forEach((btn, idx) => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons and images in this container
                tabButtons.forEach(b => b.classList.remove('is-active'));
                images.forEach(img => img.classList.remove('is-active'));

                // Add active class to clicked tab and corresponding image
                btn.classList.add('is-active');
                if (images[idx]) {
                    images[idx].classList.add('is-active');
                }
            });
        });
    });
});

// ====================
// ADDRESS PAGE TABS, GALLERIES, FLOORPLANS, SPECS ACCORDIONS
// ====================

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.address-tab');
    const tabPanels = document.querySelectorAll('.address-tabs__panel');
    const galleryControllers = new Map();

    // Initialize galleries with slideshow
    document.querySelectorAll('.address-gallery--with-main').forEach(gallery => {
        const mainImg = gallery.querySelector('.address-gallery__main-image');
        const thumbs = Array.from(gallery.querySelectorAll('.address-gallery__thumb'));

        if (!mainImg || !thumbs.length) return;

        let currentIndex = thumbs.findIndex(t => t.classList.contains('is-active'));
        if (currentIndex < 0) currentIndex = 0;

        let slideTimer = null;
        const SLIDE_INTERVAL = 3000;

        const showSlide = (index) => {
            const thumb = thumbs[index];
            const largeSrc = thumb.getAttribute('data-large-src');
            if (!largeSrc) return;

            // If already showing this image, skip
            if (mainImg.src === largeSrc || mainImg.currentSrc === largeSrc) return;

            thumbs.forEach(t => t.classList.remove('is-active'));
            thumb.classList.add('is-active');

            // Auto-scroll thumbs to show active thumb
            const thumbsContainer = gallery.querySelector('.address-gallery__thumbs');
            if (thumbsContainer) {
                const offsetLeft = thumb.offsetLeft;
                const targetWidth = thumb.offsetWidth;
                const containerWidth = thumbsContainer.clientWidth;
                const desiredScrollLeft = offsetLeft - (containerWidth - targetWidth) / 2;
                thumbsContainer.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
            }

            // Fade out current image
            mainImg.classList.add('is-fading');

            // Preload the new image to avoid flicker
            const newImg = new window.Image();
            newImg.onload = () => {
                // Fade in after fade out completes
                setTimeout(() => {
                    mainImg.src = largeSrc;
                    mainImg.classList.remove('is-fading');
                }, 260); // match CSS transition duration
            };
            newImg.onerror = () => {
                setTimeout(() => {
                    mainImg.src = largeSrc;
                    mainImg.classList.remove('is-fading');
                }, 260);
            };
            newImg.src = largeSrc;

            // Fallback timeout in case onload doesn't fire (e.g., cached images)
            setTimeout(() => {
                if (mainImg.classList.contains('is-fading')) {
                    mainImg.src = largeSrc;
                    mainImg.classList.remove('is-fading');
                }
            }, 2000);
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

        // Handle thumbnail clicks
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentIndex = index;
                showSlide(currentIndex);
                startSlideshow();
            });
        });

        // Start slideshow if gallery is in active panel
        const parentPanel = gallery.closest('.address-tabs__panel');
        const isInActivePanel = !parentPanel || parentPanel.classList.contains('address-tabs__panel--active');
        if (isInActivePanel) {
            startSlideshow();
        }

        // Store controller for later use
        galleryControllers.set(gallery, {
            start: startSlideshow,
            stop: stopSlideshow,
            resetToFirst: () => {
                // Always use showSlide to sync main image and thumb
                let activeIdx = thumbs.findIndex(t => t.classList.contains('is-active'));
                if (activeIdx < 0) activeIdx = 0;
                currentIndex = activeIdx;
                showSlide(currentIndex);
            }
        });

        // Open lightbox when main image is clicked
        mainImg.style.cursor = 'zoom-in';
        mainImg.title = 'Click to view full size';

        const thumbsContainer = gallery.querySelector('.address-gallery__thumbs');

        mainImg.addEventListener('click', () => {
            const items = thumbs.map(btn => {
                const largeSrc = btn.getAttribute('data-large-src');
                const tImg = btn.querySelector('img');
                return { src: largeSrc, alt: tImg ? tImg.alt : '' };
            });
            const startIdx = Math.max(0, currentIndex);

            // Freeze the gallery while lightbox is open
            stopSlideshow();
            if (thumbsContainer) thumbsContainer.style.pointerEvents = 'none';

            openGLightbox(items, startIdx, (finalIndex) => {
                // Restore gallery
                if (thumbsContainer) thumbsContainer.style.pointerEvents = '';
                // Sync gallery to the slide that was showing when lightbox closed
                currentIndex = finalIndex;
                showSlide(currentIndex);
                startSlideshow();
            });
        });
    });

    // Tab activation logic
    if (tabButtons.length && tabPanels.length) {
        const activateTab = (btn) => {
            const target = btn.getAttribute('data-tab');
            if (!target) return;

            // Update tab buttons
            tabButtons.forEach(b => {
                const isActive = b === btn;
                b.classList.toggle('address-tab--active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                b.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            // Update tab panels
            tabPanels.forEach(p => {
                const matches = p.id === target;
                p.classList.toggle('address-tabs__panel--active', matches);
                if (matches) {
                    p.removeAttribute('hidden');
                } else {
                    p.setAttribute('hidden', 'hidden');
                }

                // Control galleries in panels
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

            // Update URL hash silently
            window.location.hash = `#${target}`;

            // Scroll to tabs section
            const tabs = document.querySelector('.address-tabs');
            if (tabs) {
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const rect = tabs.getBoundingClientRect();
                const offsetTop = rect.top + window.pageYOffset - headerHeight;
                window.requestAnimationFrame(() => {
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                });
            }
        };

        // Event listeners for tabs
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                activateTab(btn);
            });

            btn.addEventListener('keydown', (event) => {
                const currentIndex = Array.prototype.indexOf.call(tabButtons, btn);
                let nextIndex = currentIndex;

                switch (event.key) {
                    case 'ArrowRight':
                        event.preventDefault();
                        nextIndex = (currentIndex + 1) % tabButtons.length;
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                        break;
                    case 'Home':
                        event.preventDefault();
                        nextIndex = 0;
                        break;
                    case 'End':
                        event.preventDefault();
                        nextIndex = tabButtons.length - 1;
                        break;
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        activateTab(btn);
                        return;
                    default:
                        return;
                }

                const nextBtn = tabButtons[nextIndex];
                if (nextBtn) {
                    nextBtn.focus();
                    activateTab(nextBtn);
                }
            });
        });

        // Check URL hash on load
        const hash = window.location.hash;
        if (hash.startsWith('#')) {
            const tabName = hash.slice(1);
            const btn = document.querySelector(`.address-tab[data-tab="${tabName}"]`);
            if (btn) {
                activateTab(btn);
                // Scroll to tabs section
                setTimeout(() => {
                    const tabs = document.querySelector('.address-tabs');
                    if (tabs) {
                        const header = document.querySelector('header');
                        const headerHeight = header ? header.offsetHeight : 80;
                        const rect = tabs.getBoundingClientRect();
                        const offsetTop = rect.top + window.pageYOffset - headerHeight;
                        window.requestAnimationFrame(() => {
                            window.scrollTo({
                                top: offsetTop,
                                behavior: 'smooth'
                            });
                        });
                    }
                }, 100);
            }
        }
    }

    // Sticky tabs header detection
    const tabsHeader = document.querySelector('.address-tabs__header');
    const tabsSectionEl = document.querySelector('.address-tabs');
    if (tabsHeader) {
        // Recalculate sticky start point when layout changes (images/fonts/tabs can shift offsets).
        let stickyStart = 0;
        const measureStickyStart = () => {
            const rect = tabsHeader.getBoundingClientRect();
            stickyStart = rect.top + window.scrollY;
        };

        let lastIsStuck = null;
        const updateStuck = () => {
            window.requestAnimationFrame(() => {
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const isStuck = window.scrollY >= stickyStart - headerHeight;
                if (isStuck !== lastIsStuck) {
                    tabsHeader.classList.toggle('is-stuck', isStuck);
                    if (tabsSectionEl) {
                        tabsSectionEl.classList.toggle('is-stuck', isStuck);
                    }
                    lastIsStuck = isStuck;
                }
            });
        };

        measureStickyStart();
        window.addEventListener('scroll', updateStuck, { passive: true });
        window.addEventListener('resize', () => {
            measureStickyStart();
            updateStuck();
        });

        // Tabs switching can move content and therefore sticky threshold.
        document.querySelectorAll('.address-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => {
                    measureStickyStart();
                    updateStuck();
                }, 500);
            });
        });

        updateStuck(); // initial check
    }

    // Floorplan thumbnail switching
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

    // Specs accordions
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

                // Close all groups
                groups.forEach(g => {
                    g.classList.remove('is-open');
                    const h = g.querySelector('.address-specs__group-header');
                    const b = g.querySelector('.address-specs__body');
                    if (h && b) {
                        h.setAttribute('aria-expanded', 'false');
                        b.setAttribute('hidden', 'hidden');
                    }
                });

                // Open this group if it was closed
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

    // Auto-highlight amenities
    document.querySelectorAll('.address-amenities').forEach(grid => {
        const tiles = Array.from(grid.querySelectorAll('.amenity-tile'));
        if (!tiles.length) return;

        let index = 0;

        const step = () => {
            // Skip if user is hovering
            if (tiles.some(t => t.matches(':hover'))) return;

            tiles.forEach(t => t.classList.remove(ACTIVE_CLASS));
            tiles[index].classList.add(ACTIVE_CLASS);
            index = (index + 1) % tiles.length;
        };

        // Start with first tile active
        tiles[0].classList.add(ACTIVE_CLASS);
        setInterval(step, AMENITY_INTERVAL);
    });

    // Dead code block — legacy custom lightbox removed in favour of PhotoSwipe.
    // openGLightbox() is defined at module scope; gallery/floorplan hooks below.
    if (false) { // eslint-disable-line no-constant-condition
        let panzoomInstance = null;
        let panzoomWheelHandler = null;
        let currentIndex = 0;
        let currentThumbGroup = [];
        let lastFocusedElement = null;
        const lightboxBody = lightboxImage.parentElement;

        // Touch swipe variables (single-finger when not zoomed)
        let touchStartX = null;
        let touchEndX = null;

        // Update metadata display
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

        // Set active thumbnail
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

        // Show image by index
        const showByIndex = (index) => {
            if (!currentThumbGroup.length) return;
            const total = currentThumbGroup.length;
            const wrappedIndex = ((index % total) + total) % total;
            const thumb = currentThumbGroup[wrappedIndex];
            const largeSrc = thumb.getAttribute('data-large-src');
            const thumbImg = thumb.querySelector('img');
            const thumbAlt = thumbImg && thumbImg.alt;

            if (panzoomInstance) panzoomInstance.reset({ animate: false });
            setActiveThumb(wrappedIndex);

            if (largeSrc) {
                lightboxImage.classList.add('is-navigating');
                setTimeout(() => {
                    lightboxImage.src = largeSrc;
                    if (thumbAlt) lightboxImage.alt = thumbAlt;
                    lightboxImage.classList.remove('is-navigating');
                }, 130);
            }
        };

        // Open lightbox
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
            lightboxCloseBtn.focus();
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleLightboxKeydown, true);

            // Initialise Panzoom for smooth wheel zoom, pinch-to-zoom, and mouse drag
            if (typeof Panzoom !== 'undefined') {
                panzoomInstance = Panzoom(lightboxImage, {
                    maxScale: 5,
                    minScale: 1,
                    contain: 'outside',
                    cursor: 'grab',
                    step: 0.15,
                });
                panzoomWheelHandler = panzoomInstance.zoomWithWheel;
                lightboxBody.addEventListener('wheel', panzoomWheelHandler, { passive: false });
            }
        };

        // Close lightbox
        const closeLightboxAdvanced = () => {
            if (panzoomInstance) {
                if (panzoomWheelHandler) {
                    lightboxBody.removeEventListener('wheel', panzoomWheelHandler);
                    panzoomWheelHandler = null;
                }
                panzoomInstance.destroy();
                panzoomInstance = null;
            }

            if (document.activeElement && lightbox.contains(document.activeElement)) {
                document.activeElement.blur();
            }

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

        // Handle keyboard navigation in lightbox
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

        // Get focusable elements in lightbox
        const getLightboxFocusable = () => {
            return lightbox.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
        };

        // Swipe to navigate — single finger, only when Panzoom is at base scale
        lightboxImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && (!panzoomInstance || panzoomInstance.getScale() <= 1.01)) {
                touchStartX = e.touches[0].clientX;
                touchEndX = null;
            } else {
                touchStartX = null;
            }
        }, { passive: true });

        lightboxImage.addEventListener('touchmove', (e) => {
            if (touchStartX !== null && e.touches.length === 1) {
                touchEndX = e.touches[0].clientX;
            }
        }, { passive: true });

        lightboxImage.addEventListener('touchend', () => {
            if (touchStartX !== null && touchEndX !== null) {
                const dx = touchEndX - touchStartX;
                if (Math.abs(dx) > SWIPE_THRESHOLD) {
                    dx < 0 ? showByIndex(currentIndex + 1) : showByIndex(currentIndex - 1);
                }
            }
            touchStartX = null;
            touchEndX = null;
        }, { passive: true });

        // Double-click / double-tap to reset zoom
        lightboxImage.addEventListener('dblclick', () => {
            if (panzoomInstance) panzoomInstance.reset({ animate: true });
        });

        lightboxBackdrop.addEventListener('click', closeLightboxAdvanced);
        lightboxCloseBtn.addEventListener('click', closeLightboxAdvanced);

        document.addEventListener('keydown', (event) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                closeLightboxAdvanced();
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

    } // end dead code block

});

// ====================
// FLOATING SUB-NAVIGATION
// ====================

document.addEventListener('DOMContentLoaded', function () {
    const floatingSubnav = document.getElementById('floating-subnav');
    const floatingSubnavContent = floatingSubnav ? floatingSubnav.querySelector('.floating-subnav__content') : null;
    const subnavLinks = document.querySelectorAll('.floating-subnav__link');
    const apartmentsTab = document.getElementById('tab-apartments-toggle');
    const villasTab = document.getElementById('tab-villas-toggle');
    const tabsSection = document.querySelector('.address-tabs');
    const heroSection = document.querySelector('.address-hero');
    const locationSection = document.getElementById('location');
    const footerSection = document.querySelector('footer');
    const quickNavToggle = document.getElementById('quick-nav-toggle');
    const quickNavDrawer = document.getElementById('quick-nav-drawer');
    const quickNavBackdrop = document.getElementById('quick-nav-backdrop');
    const quickNavClose = document.getElementById('quick-nav-close');
    const quickNavLinks = document.querySelectorAll('.quick-nav__link');

    if (!floatingSubnav || !subnavLinks.length || !floatingSubnavContent) {
        return;
    }
    
    let isScrolling = false;
    let lastActiveLink = null;
    let isSubnavVisible = false;
    const MIN_DESKTOP_WIDTH = 1280;
    let subnavDisabled = false;
    const ODD_BG = 'rgb(250, 246, 240)';
    const EVEN_BG = 'rgb(255, 255, 255)';
    const LOCATION_BG = 'rgb(251, 247, 238)';
    let lastAppliedBg = '';
    let quickNavActiveLink = null;
    const sectionOrder = [
        'apartments-gallery',
        'apartments-amenities',
        'apartments-floorplan',
        'apartments-specs',
        'villas-gallery',
        'villas-amenities',
        'villas-floorplan',
        'villas-specs',
        'location-community',
        'location-map'
    ];

    function getTabState() {
        const apartmentsActive = apartmentsTab ? apartmentsTab.classList.contains('address-tab--active') : true;
        const villasActive = villasTab ? villasTab.classList.contains('address-tab--active') : false;
        return { apartmentsActive, villasActive };
    }

    function handleScroll() {
        if (subnavDisabled) {
            return;
        }
        updateSubnavVisibility();
        if (!isScrolling) {
            updateActiveSection();
        }
    }

    function updateSubnavVisibility() {
        if (subnavDisabled) {
            floatingSubnav.classList.remove('is-visible');
            isSubnavVisible = false;
            return;
        }
        if (!tabsSection) {
            floatingSubnav.classList.add('is-visible');
            isSubnavVisible = true;
            return;
        }

        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        const triggerPoint = tabsSection.offsetTop;
        const shouldShow = (window.scrollY + headerHeight + 36) >= triggerPoint;

        if (shouldShow !== isSubnavVisible) {
            floatingSubnav.classList.toggle('is-visible', shouldShow);
            isSubnavVisible = shouldShow;
        }
    }

    function isTabsInView() {
        if (!tabsSection) {
            return false;
        }

        const rect = tabsSection.getBoundingClientRect();
        const buffer = 80;
        return rect.top < (window.innerHeight - buffer) && rect.bottom > buffer;
    }

    function isHeroFullyHidden() {
        if (!heroSection) {
            return true;
        }

        const rect = heroSection.getBoundingClientRect();
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        return rect.bottom <= headerHeight;
    }

    function isWithinContentArea() {
        const beforeFooter = (() => {
            if (!footerSection) {
                return true;
            }
            const footerRect = footerSection.getBoundingClientRect();
            return footerRect.top >= window.innerHeight;
        })();

        if (!locationSection) {
            return beforeFooter;
        }

        const locationRect = locationSection.getBoundingClientRect();
        const beforeLocationEnd = locationRect.bottom > 0;
        return beforeLocationEnd && beforeFooter;
    }

    // Update active section based on scroll position
    function updateActiveSection() {
        const { apartmentsActive, villasActive } = getTabState();
        updateLinkVisibility(apartmentsActive, villasActive);

        let currentSection = '';
        const scrollPosition = window.scrollY + 200; // Offset for better detection
        
        // Check which section is in view
        for (const sectionId of sectionOrder) {
            if (sectionId.startsWith('apartments') && !apartmentsActive) {
                continue;
            }
            if (sectionId.startsWith('villas') && !villasActive) {
                continue;
            }

            const element = document.getElementById(sectionId);
            if (!element || element.hidden || element.offsetParent === null) {
                continue;
            }

            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            
            if (scrollPosition >= elementTop - 40) {
                currentSection = sectionId;
            }
        }

        if (!currentSection) {
            if (apartmentsActive) {
                currentSection = 'apartments-gallery';
            } else if (villasActive) {
                currentSection = 'villas-gallery';
            } else {
                currentSection = 'location-community';
            }
        }
        
        setActiveLink(currentSection);
        updateSubnavTheme(currentSection);
    }

    function shouldShowSection(section, apartmentsActive, villasActive) {
        if (!section) {
            return true;
        }

        if (section === 'apartments' || section.startsWith('apartments-')) {
            return apartmentsActive;
        }
        if (section === 'villas' || section.startsWith('villas-')) {
            return villasActive;
        }
        return true;
    }

    function updateLinkVisibility(apartmentsActive, villasActive) {
        subnavLinks.forEach(link => {
            const section = link.getAttribute('data-section') || '';
            const shouldShow = shouldShowSection(section, apartmentsActive, villasActive);
            link.classList.toggle('is-hidden', !shouldShow);
        });

        quickNavLinks.forEach(link => {
            const section = link.getAttribute('data-section') || '';
            const shouldShow = shouldShowSection(section, apartmentsActive, villasActive);
            link.classList.toggle('is-hidden', !shouldShow);
            const parentItem = link.closest('li');
            if (parentItem) {
                parentItem.hidden = !shouldShow;
            }
        });
    }

    function setActiveLink(sectionId) {
        let activeLink = null;

        subnavLinks.forEach(link => {
            const target = link.getAttribute('data-section');
            const shouldActivate = target === sectionId;

            if (shouldActivate) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }

            if (target === sectionId) {
                activeLink = link;
            }
        });

        if (activeLink && activeLink !== lastActiveLink && activeLink.offsetParent !== null) {
            activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            lastActiveLink = activeLink;
        }

        highlightQuickNavLink(sectionId);
    }

    function highlightQuickNavLink(sectionId) {
        if (!quickNavLinks.length) {
            return;
        }

        quickNavLinks.forEach(link => {
            const matches = link.getAttribute('data-section') === sectionId;
            link.classList.toggle('is-active', matches);
            if (matches) {
                quickNavActiveLink = link;
            }
        });
    }
    
    function updateSubnavTheme(sectionId) {
        if (!sectionId) {
            return;
        }

        const sectionEl = document.getElementById(sectionId);
        if (!sectionEl) {
            return;
        }

        const alternateColor = getAlternateColor(sectionEl);
        if (!alternateColor) {
            return;
        }

        let tintedColor = alternateColor;
        if (alternateColor === ODD_BG) {
            tintedColor = '#faf6f0';
        } else if (alternateColor === EVEN_BG) {
            tintedColor = '#ffffff';
        } else {
            tintedColor = withAlpha(alternateColor, 0.96);
        }
        if (tintedColor && tintedColor !== lastAppliedBg) {
            floatingSubnavContent.style.backgroundColor = tintedColor;
            lastAppliedBg = tintedColor;
        }
    }

    function getAlternateColor(sectionEl) {
        const row = sectionEl.closest('.address-section-row');
        if (row) {
            if (row.classList.contains('address-section-row--odd')) {
                return EVEN_BG;
            }
            if (row.classList.contains('address-section-row--even')) {
                return ODD_BG;
            }
        }

        if (sectionEl.closest('.address-location')) {
            return ODD_BG;
        }

        return LOCATION_BG;
    }

    function withAlpha(color, alpha) {
        const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
        if (!rgbaMatch) {
            return color;
        }

        const parts = rgbaMatch[1].split(',').map(part => part.trim());
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);

        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
            return color;
        }

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function shouldDisableSubnav() {
        const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        return (window.innerWidth <= MIN_DESKTOP_WIDTH) || coarsePointer;
    }

    function updateSubnavAvailability(force) {
        const shouldDisable = shouldDisableSubnav();
        if (!force && shouldDisable === subnavDisabled) {
            return;
        }

        subnavDisabled = shouldDisable;
        floatingSubnav.classList.toggle('floating-subnav--hidden', subnavDisabled);
        updateQuickNavToggle();

        if (subnavDisabled) {
            floatingSubnav.classList.remove('is-visible');
            isSubnavVisible = false;
        } else {
            updateSubnavVisibility();
            updateActiveSection();
            closeQuickNav();
        }
    }

    function updateQuickNavToggle() {
        if (!quickNavToggle) {
            return;
        }

        const heroHidden = isHeroFullyHidden();
        const withinContentArea = isWithinContentArea();
        const shouldShow = subnavDisabled && heroHidden && withinContentArea;

        quickNavToggle.classList.toggle('is-hidden', !shouldShow);
        quickNavToggle.toggleAttribute('hidden', !shouldShow);
        if (!shouldShow) {
            closeQuickNav();
        }
    }

    // Handle click on subnav links
    subnavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (subnavDisabled) {
                return;
            }
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            handleSectionNavigation(targetSection);
        });
    });
    
    function handleSectionNavigation(targetSection) {
        if (!targetSection) {
            return;
        }

        setActiveLink(targetSection);
        updateSubnavTheme(targetSection);

        const activateTabIfNeeded = (tabButton) => {
            if (!tabButton || tabButton.classList.contains('address-tab--active')) {
                return false;
            }
            tabButton.click();
            return true;
        };

        const isApartmentSection = targetSection === 'apartments' || targetSection.startsWith('apartments-');
        const isVillaSection = targetSection === 'villas' || targetSection.startsWith('villas-');

        if (isApartmentSection) {
            const toggled = activateTabIfNeeded(apartmentsTab);
            if (toggled) {
                setTimeout(() => scrollToSection(targetSection), 120);
            } else {
                scrollToSection(targetSection);
            }
            return;
        }

        if (isVillaSection) {
            const toggled = activateTabIfNeeded(villasTab);
            if (toggled) {
                setTimeout(() => scrollToSection(targetSection), 120);
            } else {
                scrollToSection(targetSection);
            }
            return;
        }

        scrollToSection(targetSection);
    }

    function openQuickNav() {
        if (!quickNavDrawer || !quickNavToggle) {
            return;
        }

        quickNavDrawer.classList.add('is-open');
        quickNavDrawer.setAttribute('aria-hidden', 'false');
        quickNavToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('quick-nav-open');
    }

    function closeQuickNav() {
        if (!quickNavDrawer || !quickNavToggle) {
            return;
        }

        quickNavDrawer.classList.remove('is-open');
        quickNavDrawer.setAttribute('aria-hidden', 'true');
        quickNavToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('quick-nav-open');
    }

    if (quickNavToggle && quickNavDrawer) {
        quickNavToggle.addEventListener('click', () => {
            openQuickNav();
        });

        if (quickNavBackdrop) {
            quickNavBackdrop.addEventListener('click', closeQuickNav);
        }

        if (quickNavClose) {
            quickNavClose.addEventListener('click', closeQuickNav);
        }

        quickNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetSection = link.getAttribute('data-section');
                closeQuickNav();
                handleSectionNavigation(targetSection);
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && quickNavDrawer.classList.contains('is-open')) {
                closeQuickNav();
                if (quickNavToggle) {
                    quickNavToggle.focus();
                }
            }
        });
    }

    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            isScrolling = true;

            const getScrollOffset = () => {
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const tabsHeader = document.querySelector('.address-tabs__header');
                const tabsHeight = tabsHeader ? tabsHeader.offsetHeight : 0;
                const isInsideTabs = !!element.closest('.address-tabs');

                // Keep the section title clear of fixed header and sticky tabs when navigating inside tabs.
                return headerHeight + (isInsideTabs ? tabsHeight : 0) + 12;
            };

            const scrollOnce = (behavior) => {
                const targetTop = element.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
                window.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior
                });
            };

            scrollOnce('smooth');

            // Correct final alignment after tab/content reflow settles.
            [240, 520].forEach(delay => {
                setTimeout(() => {
                    scrollOnce('auto');
                }, delay);
            });

            // Reset scrolling flag after animation + correction passes.
            setTimeout(() => {
                isScrolling = false;
                updateActiveSection();
            }, 900);
        }
    }

    // Listen for scroll events with rAF throttling for smoother updates
    let isTicking = false;
    window.addEventListener('scroll', function () {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                updateQuickNavToggle();
                isTicking = false;
            });
            isTicking = true;
        }
    });
    
    // Listen for tab changes
    if (apartmentsTab) {
        apartmentsTab.addEventListener('click', () => setTimeout(updateActiveSection, 60));
    }
    if (villasTab) {
        villasTab.addEventListener('click', () => setTimeout(updateActiveSection, 60));
    }
    
    window.addEventListener('resize', () => {
        updateSubnavAvailability(true);
        updateQuickNavToggle();
    });

    // Initial setup
    updateSubnavAvailability(true);
    if (!subnavDisabled) {
        updateSubnavVisibility();
    }
    updateActiveSection();
    updateQuickNavToggle();
});

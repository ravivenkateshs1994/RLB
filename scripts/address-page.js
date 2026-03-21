/**
 * Address Page JavaScript
 * Handles UI interactions for floorplans, galleries, tabs, accordions, and lightbox functionality.
 */

// ====================
// CONSTANTS AND UTILITIES
// ====================

const AMENITY_INTERVAL = 2600;
const ACTIVE_CLASS = 'is-active';

// Signal that JS is running — used to gate scroll-in animation CSS
document.documentElement.classList.add('js-loaded');

// ====================
// VIEWER.JS IMAGE VIEWER HELPER
// ====================

function openLightbox(items, startIndex, onClose) {
    if (typeof Viewer === 'undefined') return;

    let currentIndex = startIndex;

    // Build a temporary off-screen image list for Viewer.js
    const container = document.createElement('ul');
    container.style.cssText = 'display:none;list-style:none;padding:0;margin:0;';
    items.forEach(item => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = item.src;
        if (item.alt) img.alt = item.alt;
        li.appendChild(img);
        container.appendChild(li);
    });
    document.body.appendChild(container);

    const viewer = new Viewer(container, {
        initialViewIndex: startIndex,
        title: false,
        navbar: items.length > 1,
        toolbar: {
            zoomIn: true,
            zoomOut: true,
            oneToOne: false,
            reset: false,
            prev: false,
            play: false,
            next: false,
            rotateLeft: false,
            rotateRight: false,
            flipHorizontal: false,
            flipVertical: false,
        },
        shown() {
            const viewerEl = viewer.viewer || document.querySelector('.viewer-container');
            if (!viewerEl) return;

            // ---- Liquid glass inline override for close button ----
            // (CDN viewer.css loads after our stylesheet so CSS alone loses)
            const closeBtn = viewerEl.querySelector('.viewer-button');
            if (closeBtn) {
                const bg = 'rgba(28, 28, 30, 0.78)';
                const bgHover = 'rgba(50, 50, 52, 0.9)';
                const shadow = '0 4px 20px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.18), inset 0 -0.5px 0 rgba(0,0,0,0.3)';
                const shadowHover = '0 6px 24px rgba(0,0,0,0.65), inset 0 0.5px 0 rgba(255,255,255,0.22), inset 0 -0.5px 0 rgba(0,0,0,0.3)';
                Object.assign(closeBtn.style, {
                    top: '1.1rem',
                    right: '1.1rem',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: bg,
                    backdropFilter: 'blur(16px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(130%)',
                    border: '1px solid rgba(255,255,255,0.13)',
                    boxShadow: shadow,
                    transition: 'background 160ms ease, box-shadow 160ms ease',
                });
                closeBtn.addEventListener('mouseenter', () => {
                    closeBtn.style.background = bgHover;
                    closeBtn.style.boxShadow = shadowHover;
                });
                closeBtn.addEventListener('mouseleave', () => {
                    closeBtn.style.background = bg;
                    closeBtn.style.boxShadow = shadow;
                });
            }

            // ---- Side nav arrows ----
            if (items.length <= 1 || viewerEl.querySelector('.viewer-nav-btn')) return;

            const prevBtn = document.createElement('button');
            prevBtn.className = 'viewer-nav-btn viewer-nav-btn--prev';
            prevBtn.setAttribute('aria-label', 'Previous image');
            prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
            prevBtn.addEventListener('click', () => viewer.prev());

            const nextBtn = document.createElement('button');
            nextBtn.className = 'viewer-nav-btn viewer-nav-btn--next';
            nextBtn.setAttribute('aria-label', 'Next image');
            nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
            nextBtn.addEventListener('click', () => viewer.next());

            viewerEl.appendChild(prevBtn);
            viewerEl.appendChild(nextBtn);
        },
        viewed(e) {
            currentIndex = e.detail.index;
        },
        hidden() {
            viewer.destroy();
            document.body.removeChild(container);
            if (typeof onClose === 'function') onClose(currentIndex);
        },
    });

    viewer.show();
}

// ====================
// FLOORPLAN ACCORDION (MOBILE) IMAGE VIEWER
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-accordion__panel img').forEach(img => {
        img.style.cursor = 'pointer';
        img.title = 'Click to view full size';
        img.addEventListener('click', function () {
            openLightbox([{ src: img.src, alt: img.alt }], 0);
        });
    });
});

// ====================
// FLOORPLAN ACCORDION (MOBILE) LOGIC
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-accordion--mobile').forEach(function (accordion) {
        const items = accordion.querySelectorAll('.floorplan-accordion__item');

        function openItem(item) {
            const header = item.querySelector('.floorplan-accordion__header');
            const panel = item.querySelector('.floorplan-accordion__panel');
            item.classList.add('open');
            header.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
            panel.style.removeProperty('display');
        }

        function closeItem(item) {
            const header = item.querySelector('.floorplan-accordion__header');
            const panel = item.querySelector('.floorplan-accordion__panel');
            item.classList.remove('open');
            header.classList.remove('active');
            header.setAttribute('aria-expanded', 'false');
            panel.style.display = 'none';
        }

        items.forEach(function (item) {
            const header = item.querySelector('.floorplan-accordion__header');
            header.setAttribute('aria-expanded', 'false');

            header.addEventListener('click', function () {
                const isOpen = item.classList.contains('open');
                // Close all
                items.forEach(function (other) { closeItem(other); });
                // Toggle this one
                if (!isOpen) { openItem(item); }
            });
        });

        // Open first panel by default
        if (items.length > 0) { openItem(items[0]); }
    });
});

// ====================
// FLOORPLAN TAB IMAGES VIEWER
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.floorplan-tabs--desktop').forEach(tabContainer => {
        const images = Array.from(tabContainer.querySelectorAll('.floorplan-tabs__image'));
        images.forEach((img, idx) => {
            img.style.cursor = 'pointer';
            img.title = 'Click to view full size';
            img.addEventListener('click', function () {
                const items = images.map(i => ({
                    src: i.getAttribute('src'),
                    alt: i.alt,
                }));
                openLightbox(items, idx);
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
        const wrappers = tabContainer.querySelectorAll('.floorplan-tabs__image-wrap');

        tabButtons.forEach((btn, idx) => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons and wrappers in this container
                tabButtons.forEach(b => b.classList.remove('is-active'));
                wrappers.forEach(w => w.classList.remove('is-active'));

                // Add active class to clicked tab and corresponding wrapper
                btn.classList.add('is-active');
                if (wrappers[idx]) {
                    wrappers[idx].classList.add('is-active');
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

            openLightbox(items, startIdx, (finalIndex) => {
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
    const MIN_DESKTOP_WIDTH = 1900;
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

// ====================
// SCROLL-IN ANIMATION — SPECS CARDS
// ====================

document.addEventListener('DOMContentLoaded', function () {
    if (!window.IntersectionObserver) return;

    const cards = document.querySelectorAll('.specs-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            const delay = parseInt(card.dataset.animDelay || '0', 10);
            setTimeout(() => card.classList.add('is-visible'), delay);
            observer.unobserve(card);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // Group cards by their parent specs section for per-section stagger
    const grouped = new Map();
    cards.forEach((card) => {
        const parent = card.parentElement;
        if (!grouped.has(parent)) grouped.set(parent, []);
        grouped.get(parent).push(card);
    });

    grouped.forEach((group) => {
        group.forEach((card, i) => {
            card.dataset.animDelay = String(Math.min(i * 70, 350));
            observer.observe(card);
        });
    });
});

// ====================
// SPECS CARD ACCORDION
// ====================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-specs-card]').forEach(function (card) {
        const trigger = card.querySelector('.specs-card__trigger');
        const panel = card.querySelector('.specs-card__panel');
        if (!trigger || !panel) return;

        // Start all panels expanded
        panel.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');

        trigger.addEventListener('click', function () {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!isExpanded));
            if (isExpanded) {
                panel.setAttribute('hidden', '');
            } else {
                panel.removeAttribute('hidden');
            }
        });
    });
});

// ====================
// FLOATING ENQUIRE FAB
// ====================

document.addEventListener('DOMContentLoaded', function () {
    const fab = document.getElementById('enquire-fab');
    if (!fab) return;
    const hero = document.querySelector('.address-hero');
    const sectionsBtn = document.getElementById('quick-nav-toggle');

    const updateFab = () => {
        const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : true;
        const sectionsBtnVisible = sectionsBtn
            ? !sectionsBtn.classList.contains('is-hidden') && !sectionsBtn.hasAttribute('hidden')
            : false;
        fab.classList.toggle('is-visible', heroGone || sectionsBtnVisible);
    };

    window.addEventListener('scroll', updateFab, { passive: true });

    // Also re-check whenever the Sections button changes visibility
    if (sectionsBtn) {
        const mo = new MutationObserver(updateFab);
        mo.observe(sectionsBtn, { attributes: true, attributeFilter: ['class', 'hidden'] });
    }

    updateFab();
});

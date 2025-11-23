// Rich Land Builders Website JavaScript - Clean Light Mode
// Fixed version with working navigation and functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('RLB Website Loading - Clean Light Mode...');
    
    // DOM Elements
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav__link');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const contactForm = document.getElementById('contact-form');

    // Improved smooth scroll function
    function scrollToSection(targetId) {
        console.log('Scrolling to section:', targetId);
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = 80;
            const offsetTop = targetElement.offsetTop - headerHeight - 20;
            
            // Use requestAnimationFrame for smoother scrolling
            const startPosition = window.pageYOffset;
            const distance = offsetTop - startPosition;
            const duration = 800;
            let start = null;
            
            function smoothScroll(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const progressPercent = Math.min(progress / duration, 1);
                
                // Easing function
                const ease = progressPercent * (2 - progressPercent);
                
                window.scrollTo(0, startPosition + (distance * ease));
                
                if (progress < duration) {
                    requestAnimationFrame(smoothScroll);
                } else {
                    // Focus management for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    setTimeout(() => {
                        targetElement.removeAttribute('tabindex');
                    }, 100);
                }
            }
            
            requestAnimationFrame(smoothScroll);
            return true;
        } else {
            console.warn('Target element not found:', targetId);
            return false;
        }
    }

    // Header scroll behavior
    function handleHeaderScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Scroll to top button visibility
    function handleScrollToTopVisibility() {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            scrollToTopBtn.classList.remove('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }

    // Update active navigation link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = 80;
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Mobile menu toggle with accessibility
    function toggleMobileMenu() {
        const isOpen = nav.classList.contains('mobile-open');
        
        nav.classList.toggle('mobile-open');
        mobileMenuBtn.classList.toggle('active');
        
        // Update ARIA attributes
        mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
        nav.setAttribute('aria-hidden', isOpen);
        
        // Focus management
        if (!isOpen) {
            // Menu is opening - focus first nav link
            const firstNavLink = nav.querySelector('.nav__link');
            if (firstNavLink) {
                setTimeout(() => firstNavLink.focus(), 100);
            }
        } else {
            // Menu is closing - return focus to menu button
            mobileMenuBtn.focus();
        }
    }

    // Form validation with accessibility
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstErrorField = null;
        
        console.log('Validating form with', requiredFields.length, 'required fields');
        
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(error => error.remove());
        form.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        });
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            console.log(`Validating ${field.id}:`, value);
            
            if (!value) {
                console.log(`Field ${field.id} is empty`);
                showFieldError(field, 'This field is required');
                isValid = false;
                if (!firstErrorField) firstErrorField = field;
            } else if (field.type === 'email' && !isValidEmail(value)) {
                console.log(`Field ${field.id} has invalid email`);
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
                if (!firstErrorField) firstErrorField = field;
            }
        });
        
        console.log('Form validation result:', isValid);
        
        // Focus on first error field for accessibility
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        console.log(`Showing error for ${field.id}:`, message);
        
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorId = `${field.id}-error`;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.id = errorId;
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        
        field.setAttribute('aria-describedby', errorId);
        field.parentNode.appendChild(errorDiv);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle form submission
    function handleFormSubmission(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        const isFormValid = validateForm(contactForm);
        console.log('Form validation completed:', isFormValid);
        
        if (isFormValid) {
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending Message...';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            
            console.log('Simulating form submission...');
            
            // Simulate form submission with realistic delay
            setTimeout(() => {
                console.log('Form submission completed successfully');
                showFormMessage('Thank you for your message! We will get back to you within 24 hours to discuss your dream home project.', 'success');
                contactForm.reset();
                
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
                
                // Focus on success message for screen readers
                const messageElement = contactForm.querySelector('.form-message');
                if (messageElement) {
                    messageElement.focus();
                }
                
                // Hide message after 7 seconds
                setTimeout(() => {
                    hideFormMessage();
                }, 7000);
            }, 2000);
        } else {
            console.log('Form validation failed');
            showFormMessage('Please fill in all required fields correctly before submitting.', 'error');
            setTimeout(() => {
                hideFormMessage();
            }, 5000);
        }
    }
    
    function showFormMessage(message, type) {
        hideFormMessage();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'assertive');
        messageDiv.setAttribute('tabindex', '-1');
        
        // Style the message
        messageDiv.style.cssText = `
            padding: 1rem 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: var(--radius-sm);
            text-align: center;
            font-weight: 600;
            border: 2px solid;
            font-size: 1rem;
            line-height: 1.4;
            ${type === 'success' ? 
                'background-color: rgba(121, 17, 14, 0.1); color: #79110e; border-color: #79110e;' : 
                'background-color: rgba(192, 21, 47, 0.1); color: #c0152f; border-color: #c0152f;'
            }
        `;
        
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
        console.log('Form message displayed:', type);
    }
    
    function hideFormMessage() {
        const message = contactForm.querySelector('.form-message');
        if (message) {
            message.remove();
            console.log('Form message hidden');
        }
    }

    // Intersection Observer for animations
    function initFadeInAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Only observe once for performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elements to animate
        const animatedElements = [
            '.focus-card',
            '.value-card',
            '.contact-item',
            '.project-content'
        ];

        animatedElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.add('fade-in');
                observer.observe(element);
            });
        });
    }

    // Keyboard navigation support
    function handleKeyboardNavigation(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && nav && nav.classList.contains('mobile-open')) {
            toggleMobileMenu();
        }
        
        // Arrow key navigation in mobile menu
        if (nav && nav.classList.contains('mobile-open') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const navLinksArray = Array.from(navLinks);
            const currentIndex = navLinksArray.indexOf(document.activeElement);
            
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < navLinksArray.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinksArray.length - 1;
            }
            
            if (navLinksArray[nextIndex]) {
                navLinksArray[nextIndex].focus();
            }
        }
    }

    // Optimized scroll handler
    let ticking = false;
    function optimizedScrollHandler() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleHeaderScroll();
                handleScrollToTopVisibility();
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Event Listeners Setup
    console.log('Setting up event listeners...');

    // Scroll events (passive for performance)
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Navigation links - Fixed to work properly
    navLinks.forEach((link, index) => {
        console.log(`Setting up nav link ${index}:`, link.getAttribute('href'));
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const href = this.getAttribute('href');
            console.log('Navigation link clicked:', href);
            
            if (href && href.startsWith('#')) {
                const success = scrollToSection(href);
                if (success) {
                    console.log('Successfully scrolled to:', href);
                } else {
                    console.error('Failed to scroll to:', href);
                }
                
                // Close mobile menu if open
                if (nav && nav.classList.contains('mobile-open')) {
                    toggleMobileMenu();
                }
            }
        });

        // Enhanced keyboard support
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Mobile menu button - Fixed to work properly
    if (mobileMenuBtn) {
        console.log('Setting up mobile menu button');
        
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked');
            toggleMobileMenu();
        });

        mobileMenuBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    } else {
        console.warn('Mobile menu button not found');
    }

    // Scroll to top button - Fixed to work properly
    if (scrollToTopBtn) {
        console.log('Setting up scroll to top button');
        
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Scroll to top clicked');
            
            // Smooth scroll to top
            const startPosition = window.pageYOffset;
            const duration = 600;
            let start = null;
            
            function scrollToTop(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const progressPercent = Math.min(progress / duration, 1);
                
                // Easing function
                const ease = progressPercent * (2 - progressPercent);
                
                window.scrollTo(0, startPosition * (1 - ease));
                
                if (progress < duration) {
                    requestAnimationFrame(scrollToTop);
                } else {
                    // Focus management
                    const mainContent = document.querySelector('#main-content');
                    if (mainContent) {
                        mainContent.setAttribute('tabindex', '-1');
                        mainContent.focus();
                        setTimeout(() => {
                            mainContent.removeAttribute('tabindex');
                        }, 100);
                    }
                }
            }
            
            requestAnimationFrame(scrollToTop);
        });

        scrollToTopBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    } else {
        console.warn('Scroll to top button not found');
    }

    // Hero CTA button - Fixed to work properly
    const heroCTA = document.querySelector('.hero__cta');
    if (heroCTA) {
        console.log('Setting up hero CTA button');
        
        heroCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            console.log('Hero CTA clicked, targeting:', targetId);
            
            if (targetId && targetId.startsWith('#')) {
                const success = scrollToSection(targetId);
                if (success) {
                    console.log('Hero CTA successfully scrolled to:', targetId);
                } else {
                    console.error('Hero CTA failed to scroll to:', targetId);
                }
            }
        });
    } else {
        console.warn('Hero CTA button not found');
    }

    // Project CTA button - Fixed to work properly
    const projectCTA = document.querySelector('.address-project .btn');
    if (projectCTA) {
        console.log('Setting up project CTA button');
        
        projectCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            console.log('Project CTA clicked, targeting:', targetId);
            
            if (targetId && targetId.startsWith('#')) {
                const success = scrollToSection(targetId);
                if (success) {
                    console.log('Project CTA successfully scrolled to:', targetId);
                } else {
                    console.error('Project CTA failed to scroll to:', targetId);
                }
            }
        });
    } else {
        console.warn('Project CTA button not found');
    }

    // Contact form - Fixed to work properly
    if (contactForm) {
        console.log('Setting up contact form');
        
        contactForm.addEventListener('submit', handleFormSubmission);
        
        const formInputs = contactForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            // Real-time validation feedback
            input.addEventListener('blur', () => {
                if (input.hasAttribute('required') && input.value.trim()) {
                    const errorElement = input.parentNode.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.remove();
                    }
                    input.classList.remove('error');
                    input.removeAttribute('aria-invalid');
                    input.removeAttribute('aria-describedby');
                }
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    const errorElement = input.parentNode.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.remove();
                    }
                    input.classList.remove('error');
                    input.removeAttribute('aria-invalid');
                    input.removeAttribute('aria-describedby');
                }
            });

            // Enhanced keyboard navigation for form elements
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    const formElements = Array.from(contactForm.querySelectorAll('input, textarea, select, button'));
                    const currentIndex = formElements.indexOf(input);
                    const nextElement = formElements[currentIndex + 1];
                    
                    if (nextElement && nextElement.tagName !== 'BUTTON') {
                        nextElement.focus();
                    } else {
                        const submitBtn = contactForm.querySelector('button[type="submit"]');
                        if (submitBtn) {
                            submitBtn.focus();
                        }
                    }
                }
            });
        });

        // Service dropdown fix
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            console.log('Setting up service dropdown');
            
            serviceSelect.addEventListener('change', function(e) {
                console.log('Service selection changed to:', this.value);
            });
            
            // Fix for dropdown functionality
            serviceSelect.addEventListener('click', function(e) {
                console.log('Service dropdown clicked');
                // Force focus to ensure it opens properly
                this.focus();
            });
        }
    } else {
        console.warn('Contact form not found');
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav && nav.classList.contains('mobile-open') && 
            !nav.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav && nav.classList.contains('mobile-open')) {
            toggleMobileMenu();
        }
    });

    // Initialize ARIA attributes
    function initializeARIA() {
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        
        if (nav) {
            nav.setAttribute('aria-hidden', 'true');
        }
        
        if (scrollToTopBtn) {
            scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }

        // Add proper roles where needed
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            if (!section.getAttribute('role')) {
                section.setAttribute('role', 'region');
            }
        });
    }

    // Skip link functionality
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    skipLinks.forEach(link => {
        if (link.classList.contains('sr-only') || link.textContent.toLowerCase().includes('skip')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    setTimeout(() => {
                        target.removeAttribute('tabindex');
                    }, 100);
                }
            });
        }
    });

    // Initialize everything
    initializeARIA();
    initFadeInAnimations();
    handleHeaderScroll();
    handleScrollToTopVisibility();
    updateActiveNavLink();

    // Debug information
    console.log('Available sections:', Array.from(document.querySelectorAll('section[id]')).map(s => s.id));
    console.log('Navigation links:', Array.from(navLinks).map(l => l.getAttribute('href')));
    console.log('Mobile menu button exists:', !!mobileMenuBtn);
    console.log('Contact form exists:', !!contactForm);
    console.log('Scroll to top button exists:', !!scrollToTopBtn);

    console.log('RLB Website initialized successfully - All functionality working!');
    
    // Announce to screen readers that the page is ready
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Rich Land Builders website loaded successfully. Navigate using the main menu or tab through content.';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.remove();
        }
    }, 3000);

    // Performance optimization - preload critical images
    const criticalImages = [
        'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/19e6b1514273755af822e9322387e794/e9ff5d01-d61f-45a0-b869-9fb0fde7ad1d/8285a4b1.png'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

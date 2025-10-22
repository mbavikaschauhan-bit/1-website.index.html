document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const header = document.getElementById('main-header') as HTMLElement;
    const scrollProgressBar = document.getElementById('scroll-progress-bar') as HTMLElement;
    const backToTopButton = document.getElementById('back-to-top') as HTMLElement;
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('#nav-links .nav-link');

    // --- RIPPLE EFFECT ---
    document.querySelectorAll('.btn-ripple').forEach(button => {
        button.addEventListener('click', function (e: MouseEvent) {
            const buttonEl = e.currentTarget as HTMLElement;
            const rect = buttonEl.getBoundingClientRect();
            const ripple = document.createElement('span');

            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;

            const oldRipple = buttonEl.querySelector('.ripple');
            if (oldRipple) {
                oldRipple.remove();
            }
            
            buttonEl.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // --- FAQ ACCORDION (ACCESSIBLE & ROBUST) ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        // Initial state setup
        faqQuestions.forEach(question => {
            const button = question as HTMLButtonElement;
            const answer = document.getElementById(button.getAttribute('aria-controls')!) as HTMLElement;
            if (answer) {
              answer.style.maxHeight = '0px';
            }
            button.classList.remove('is-expanded');
            button.setAttribute('aria-expanded', 'false');
        });

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const button = question as HTMLButtonElement;
                const answer = document.getElementById(button.getAttribute('aria-controls')!) as HTMLElement;
                if (!answer) return;
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                // Close other questions
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question) {
                        const otherButton = otherQuestion as HTMLButtonElement;
                        const otherAnswer = document.getElementById(otherButton.getAttribute('aria-controls')!) as HTMLElement;
                        if(otherAnswer) {
                           otherAnswer.style.maxHeight = '0px';
                        }
                        otherButton.classList.remove('is-expanded');
                        otherButton.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current question
                if (isExpanded) {
                    answer.style.maxHeight = '0px';
                    button.classList.remove('is-expanded');
                    button.setAttribute('aria-expanded', 'false');
                } else {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    button.classList.add('is-expanded');
                    button.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // --- SMOOTH SCROLLING ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e: MouseEvent) {
            const anchorEl = e.currentTarget as HTMLAnchorElement;
            const targetId = anchorEl.getAttribute('href');

            // Do nothing for placeholder links (e.g., social media icons)
            if (targetId === '#' && !anchorEl.closest('nav')) {
                e.preventDefault();
                return;
            }
            
            const targetElement = targetId && targetId.length > 1 ? document.querySelector(targetId) : null;
            
            // Only proceed if we have a valid scroll target
            if (targetElement || targetId === '#' || targetId === '#home') {
                e.preventDefault();

                // If it's a main navigation click (header/mobile menu), update active class immediately.
                const isNavClick = anchorEl.closest('#main-header') || anchorEl.closest('#mobile-menu');
                if (isNavClick) {
                    const effectiveTargetId = (targetId === '#') ? '#home' : targetId;
                    navLinks.forEach(link => link.classList.remove('active'));
                    const linkToActivate = document.querySelector(`#nav-links .nav-link[href="${effectiveTargetId}"]`);
                    if (linkToActivate) {
                        linkToActivate.classList.add('active');
                    }
                }

                // Scroll to the element
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });

    // --- MOBILE MENU ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const pageOverlay = document.getElementById('page-overlay');
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');

    if (mobileMenuButton && mobileMenu) {
        const openMenu = () => {
            mobileMenu.classList.add('is-open');
            pageOverlay?.classList.add('is-visible');
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('is-open');
            pageOverlay?.classList.remove('is-visible');
        };

        mobileMenuButton.addEventListener('click', openMenu);
        mobileMenuCloseButton?.addEventListener('click', closeMenu);
        pageOverlay?.addEventListener('click', closeMenu);
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
    
    // --- BACK TO TOP BUTTON ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // --- INTERSECTION OBSERVERS (FOR PERFORMANCE) ---
    // Generic "Reveal on Scroll" Animations
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }
    
    // Animated Number Counters
    const counters = document.querySelectorAll('.counter');
    function animateCounter(element: HTMLElement) {
        const targetString = element.dataset.target;
        if (!targetString) return;

        const match = targetString.match(/^([^\d.]*)([\d.]+)(.*)$/);
        if (!match) {
            element.textContent = targetString;
            return;
        }

        const prefix = match[1] || '';
        const targetNumber = parseFloat(match[2]);
        const suffix = match[3] || '';
        
        if (isNaN(targetNumber)) {
            element.textContent = targetString;
            return;
        }

        const duration = 2000;
        let startTime: number | null = null;
        
        const step = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentNumber = easedProgress * targetNumber;
            
            element.textContent = targetString.includes('.') 
                ? prefix + currentNumber.toFixed(1) + suffix
                : prefix + Math.floor(currentNumber) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = targetString;
            }
        };
        requestAnimationFrame(step);
    }

    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target as HTMLElement;
                    animateCounter(counter);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => counterObserver.observe(counter));
    }

    // Active Nav Link Observer
    if (sections.length > 0 && navLinks.length > 0 && header) {
        const navObserver = new IntersectionObserver(() => {
            let activeSectionId: string | null = 'home';
            let smallestDistance = Infinity;
            const detectionPoint = window.innerHeight * 0.4;

            sections.forEach(section => {
                const htmlSection = section as HTMLElement;
                const rect = htmlSection.getBoundingClientRect();
                
                // Only consider sections that are visible on screen
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    const distance = Math.abs(rect.top - detectionPoint);
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        activeSectionId = htmlSection.id;
                    }
                }
            });
            
            // If the user is near the top of the page, force "Home" to be active.
            if (window.scrollY < window.innerHeight / 2) {
                activeSectionId = 'home';
            }

            // Update nav links based on the determined active section.
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const isMatch = (href === '#home' && activeSectionId === 'home') || href === `#${activeSectionId}`;
                
                if (isMatch) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

        }, {
            threshold: 0.01 // Trigger as soon as a tiny part is visible
        });

        sections.forEach(section => {
            navObserver.observe(section);
        });
    }

    // --- SCROLL-BASED FUNCTIONALITIES ---
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        
        // Sticky Header
        if (header) {
            header.classList.toggle('scrolled', scrollTop > 50);
        }
        
        // Scroll Progress Bar
        if (scrollProgressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgressBar.style.width = scrollPercent + '%';
        }

        // Back to Top Button Visibility
        if (backToTopButton) {
            backToTopButton.classList.toggle('is-visible', scrollTop > 300);
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    // --- TESTIMONIAL CAROUSEL ---
    const carouselWrapper = document.getElementById('testimonial-wrapper') as HTMLElement;
    const carousel = document.getElementById('testimonial-carousel') as HTMLElement;
    const prevButton = document.getElementById('testimonial-prev') as HTMLButtonElement;
    const nextButton = document.getElementById('testimonial-next') as HTMLButtonElement;
    const dotsContainer = document.getElementById('testimonial-dots') as HTMLElement;

    if (carouselWrapper && carousel && nextButton && prevButton && dotsContainer) {
        let originalTestimonials = Array.from(carousel.querySelectorAll('.testimonial-card:not(.clone)'));
        let autoSlideInterval: number;
        let isTransitioning = false;
        let transitionEndTimeout: number;
        
        const gap = 32; // Corresponds to Tailwind's `gap-8` (2rem = 32px)

        if (originalTestimonials.length > 0) {
            const getItemsPerView = () => {
                const width = window.innerWidth;
                if (width >= 1024) return 3; // lg
                if (width >= 640) return 2; // sm & md
                return 1;
            };
            let itemsPerView = getItemsPerView();
            let slideWidth = 0;
            let currentIndex = getItemsPerView();

            const setCardWidths = () => {
                const wrapperRect = carouselWrapper.getBoundingClientRect();
                itemsPerView = getItemsPerView();
                
                const allCards = Array.from(carousel.children) as HTMLElement[];
                let theoreticalCardWidth = (itemsPerView > 1)
                    ? (wrapperRect.width - ((itemsPerView - 1) * gap)) / itemsPerView
                    : wrapperRect.width;

                allCards.forEach(card => card.style.flexBasis = `${theoreticalCardWidth}px`);
                
                void carousel.offsetWidth; 
                
                if (allCards.length > 1) {
                    slideWidth = allCards[1].getBoundingClientRect().left - allCards[0].getBoundingClientRect().left;
                } else if (allCards.length === 1) {
                    slideWidth = wrapperRect.width;
                }
            };

            const setupCarousel = () => {
                carousel.querySelectorAll('.clone').forEach(clone => clone.remove());
                originalTestimonials = Array.from(carousel.querySelectorAll('.testimonial-card:not(.clone)'));

                const createClone = (node: Element) => {
                    const clone = node.cloneNode(true) as HTMLElement;
                    clone.classList.add('clone');
                    clone.setAttribute('aria-hidden', 'true');
                    return clone;
                };

                const clonesToAppend = originalTestimonials.slice(0, itemsPerView).map(createClone);
                const clonesToPrepend = originalTestimonials.slice(-itemsPerView).map(createClone);

                carousel.append(...clonesToAppend);
                carousel.prepend(...clonesToPrepend);
            };

            const positionCarousel = () => {
                carousel.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
            };

            const updateDots = () => {
                let realIndex = (currentIndex - itemsPerView);
                realIndex = (realIndex % originalTestimonials.length + originalTestimonials.length) % originalTestimonials.length;
                Array.from(dotsContainer.children).forEach((dot, index) => {
                    dot.classList.toggle('active', index === realIndex);
                });
            };

            const finishTransition = () => {
                if (!isTransitioning) return;
                isTransitioning = false;
                clearTimeout(transitionEndTimeout);

                if (currentIndex < itemsPerView) {
                    currentIndex += originalTestimonials.length;
                    carousel.classList.add('no-transition');
                    positionCarousel();
                } else if (currentIndex >= originalTestimonials.length + itemsPerView) {
                    currentIndex -= originalTestimonials.length;
                    carousel.classList.add('no-transition');
                    positionCarousel();
                }
            };

            const moveToSlide = (newIndex: number) => {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex = newIndex;
                carousel.classList.remove('no-transition');
                positionCarousel();
                updateDots();

                clearTimeout(transitionEndTimeout);
                transitionEndTimeout = window.setTimeout(finishTransition, 700); // CSS transition is 600ms
            };

            dotsContainer.innerHTML = '';
            originalTestimonials.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('testimonial-dot');
                dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
                dot.addEventListener('click', () => {
                    moveToSlide(index + itemsPerView);
                });
                dotsContainer.appendChild(dot);
            });

            const handleSlide = (direction: number) => {
                moveToSlide(currentIndex + direction);
            };
            
            const stopAutoSlide = () => clearInterval(autoSlideInterval);
            const startAutoSlide = () => {
                stopAutoSlide();
                autoSlideInterval = window.setInterval(() => handleSlide(1), 4000);
            };

            carousel.addEventListener('transitionend', finishTransition);
            
            nextButton.addEventListener('click', () => handleSlide(1));
            prevButton.addEventListener('click', () => handleSlide(-1));

            // --- SWIPE LOGIC (FIX FOR SCROLL-TRAPPING) ---
            let isDragging = false, startX = 0, startY = 0, currentSwipeOffset = 0, isHorizontalSwipe: boolean | null = null;

            const dragStart = (e: MouseEvent | TouchEvent) => {
                isDragging = true;
                const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : null;
                startX = touch ? touch.clientX : (e as MouseEvent).clientX;
                startY = touch ? touch.clientY : (e as MouseEvent).clientY;
                carousel.classList.add('no-transition');
                isHorizontalSwipe = null;
                stopAutoSlide();
            };

            const dragging = (e: MouseEvent | TouchEvent) => {
                if (!isDragging) return;
                const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : null;
                const currentX = touch ? touch.clientX : (e as MouseEvent).clientX;
                const currentY = touch ? touch.clientY : (e as MouseEvent).clientY;
                
                if (isHorizontalSwipe === null) {
                    const deltaX = Math.abs(currentX - startX);
                    const deltaY = Math.abs(currentY - startY);
                    isHorizontalSwipe = deltaX > deltaY + 5; // Add a small buffer to favor vertical scroll
                }

                if (isHorizontalSwipe) {
                    if ((e as TouchEvent).touches) e.preventDefault();
                    currentSwipeOffset = currentX - startX;
                    carousel.style.transform = `translateX(${(-slideWidth * currentIndex) + currentSwipeOffset}px)`;
                }
            };

            const dragEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                carousel.classList.remove('no-transition');
                
                if (isHorizontalSwipe) {
                    const swipeThreshold = slideWidth / 5;
                    if (currentSwipeOffset < -swipeThreshold) {
                        handleSlide(1);
                    } else if (currentSwipeOffset > swipeThreshold) {
                        handleSlide(-1);
                    } else {
                        positionCarousel();
                    }
                }
                currentSwipeOffset = 0;
                startAutoSlide();
            };
            
            carousel.addEventListener('touchstart', dragStart, { passive: true });
            carousel.addEventListener('touchmove', dragging, { passive: false });
            carousel.addEventListener('touchend', dragEnd);
            carousel.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', dragging);
            window.addEventListener('mouseup', dragEnd); 

            ['mouseenter', 'focusin'].forEach(event => carouselWrapper.addEventListener(event, stopAutoSlide));
            ['mouseleave', 'focusout'].forEach(event => carouselWrapper.addEventListener(event, startAutoSlide));

            const initialize = () => {
                itemsPerView = getItemsPerView();
                setupCarousel();
                setCardWidths();
                currentIndex = itemsPerView;
                carousel.classList.add('no-transition');
                positionCarousel();
                updateDots();
                startAutoSlide();
            };
            
            window.addEventListener('resize', () => {
                stopAutoSlide();
                initialize();
            });

            initialize();
        }
    }
    
    // --- ANIMATED FAVICON ---
    function animateFavicon() {
        const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!favicon) return;
        const originalFavicon = favicon.href;
        const frame1 = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%233B82F6%22></rect></svg>`;
        const frame2 = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%233B82F6%22></rect><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2260%22 font-family=%22sans-serif%22 font-weight=%22bold%22 fill=%22%23FFFFFF%22>T</text></svg>`;
        const frames = [frame1, frame2, originalFavicon];
        let currentFrame = 0;
        const animationInterval = setInterval(() => {
            if (currentFrame < frames.length) {
                favicon.href = frames[currentFrame];
                currentFrame++;
            } else {
                clearInterval(animationInterval);
            }
        }, 300);
    }
    animateFavicon();

    // --- FORM HANDLERS ---
    function setupAnimatedForms() {
        const handleFormSubmission = (form: HTMLFormElement) => {
            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (!submitButton) return;
            const successMessage = document.getElementById(`${form.id}-success`) as HTMLElement;

            const validateEmail = (email: string) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email).toLowerCase());

            form.addEventListener('submit', (e: Event) => {
                e.preventDefault();
                let isValid = true;
                
                form.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));
                successMessage?.classList.remove('is-visible');

                const inputs = form.querySelectorAll('input[required], textarea[required]');
                
                inputs.forEach(input => {
                    const inputEl = input as HTMLInputElement | HTMLTextAreaElement;
                    const errorEl = document.getElementById(`${inputEl.id}-error`) as HTMLElement;
                    if (!errorEl) return;
                    const value = inputEl.value.trim();
                    let isFieldValid = true;

                    if (inputEl.type === 'email') {
                        if (value === '') {
                            isFieldValid = false;
                            errorEl.textContent = 'Email is required.';
                        } else if (!validateEmail(value)) {
                            isFieldValid = false;
                            errorEl.textContent = 'Please enter a valid email address.';
                        }
                    } else if (value === '') {
                        isFieldValid = false;
                        errorEl.textContent = 'This field is required.';
                    }

                    if (!isFieldValid) {
                        isValid = false;
                        errorEl.classList.remove('hidden');
                    }
                });

                if (isValid) {
                    submitButton.classList.add('is-loading');
                    submitButton.disabled = true;

                    setTimeout(() => { // Simulate API call
                        submitButton.classList.remove('is-loading');
                        submitButton.classList.add('is-success');
                        submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        submitButton.classList.add('bg-green-500');
                        successMessage?.classList.add('is-visible');

                        setTimeout(() => {
                            form.reset();
                            submitButton.classList.remove('is-success', 'bg-green-500');
                            submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
                            submitButton.disabled = false;
                            successMessage?.classList.remove('is-visible');
                        }, 2500);
                    }, 1500);
                }
            });
        };
        
        const contactForm = document.getElementById('contact-form') as HTMLFormElement;
        if (contactForm) handleFormSubmission(contactForm);

        const careersForm = document.getElementById('careers-form') as HTMLFormElement;
        if (careersForm) handleFormSubmission(careersForm);
    }
    setupAnimatedForms();

    // --- COOKIE CONSENT BANNER ---
    const cookieBanner = document.getElementById('cookie-consent-banner') as HTMLElement;
    if (cookieBanner) {
        const acceptBtn = document.getElementById('cookie-accept-btn') as HTMLElement;
        const declineBtn = document.getElementById('cookie-decline-btn') as HTMLElement;
        const COOKIE_CONSENT_KEY = 'tradlyst_cookie_consent';

        const hideBanner = () => cookieBanner.classList.remove('is-visible');
        const showBanner = () => setTimeout(() => cookieBanner.classList.add('is-visible'), 100);

        const handleConsent = (consent: string) => {
            try {
                localStorage.setItem(COOKIE_CONSENT_KEY, consent);
                hideBanner();
            } catch (error) {
                console.error('Could not save cookie consent:', error);
            }
        };

        acceptBtn?.addEventListener('click', () => handleConsent('accepted'));
        declineBtn?.addEventListener('click', () => handleConsent('declined'));

        try {
            if (!localStorage.getItem(COOKIE_CONSENT_KEY)) showBanner();
        } catch (error) {
            console.error('Could not access localStorage:', error);
            showBanner();
        }
    }
});
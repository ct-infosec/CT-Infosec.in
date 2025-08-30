// Main JavaScript file for CT Infosec website
class CTInfosecApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initNavigation();
        this.initAnimations();
        this.initContactForm();
        this.initTiltEffect();
        this.initScrollEffects();
        this.initUnconventionalFeatures();
    }

    setupEventListeners() {
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handlePageLoad() {
        // Remove loading states and trigger initial animations
        document.body.classList.add('loaded');
        this.updateActiveNavOrb();
    }

    handleScroll() {
        this.updateActiveNavOrb();
        this.animateOnScroll();
        this.updateScrollIndicator();
    }

    handleResize() {
        // Handle responsive changes
        this.updateTiltEffects();
    }

    // Navigation System
    initNavigation() {
        const navOrbs = document.querySelectorAll('.nav-orb');
        const navToggle = document.getElementById('navToggle');

        navOrbs.forEach((orb, index) => {
            const section = orb.dataset.section;
            
            orb.addEventListener('click', () => {
                this.scrollToSection(section);
            });

            // Add hover tooltips
            this.addTooltip(orb, this.getSectionName(section));
        });

        // Mobile navigation toggle
        navToggle?.addEventListener('click', () => {
            this.toggleMobileNav();
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavOrb() {
        const sections = ['hero', 'services', 'about', 'contact'];
        const navOrbs = document.querySelectorAll('.nav-orb');
        const scrollPosition = window.scrollY + 100;

        let activeSection = 'hero';

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && scrollPosition >= section.offsetTop) {
                activeSection = sectionId;
            }
        });

        navOrbs.forEach(orb => {
            orb.classList.toggle('active', orb.dataset.section === activeSection);
        });
    }

    getSectionName(sectionId) {
        const names = {
            hero: 'Home',
            services: 'Services',
            about: 'About',
            contact: 'Contact'
        };
        return names[sectionId] || sectionId;
    }

    addTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--card-bg);
            color: var(--text-primary);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1000;
        `;

        element.style.position = 'relative';
        element.appendChild(tooltip);

        element.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });

        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    }

    toggleMobileNav() {
        const nav = document.getElementById('nav');
        const navToggle = document.getElementById('navToggle');
        
        nav.classList.toggle('mobile-open');
        navToggle.classList.toggle('active');
    }

    // Animation System
    initAnimations() {
        // Intersection Observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.service-card, .client-card, .credential-item, .step, .contact-item'
        );

        animateElements.forEach(el => {
            el.classList.add('fade-in');
            this.observer.observe(el);
        });
    }

    animateOnScroll() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-shapes');
        
        parallax.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const scrolled = window.pageYOffset;
            scrollIndicator.style.opacity = scrolled > 100 ? '0' : '1';
        }
    }

    // Contact Form
    initContactForm() {
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(form, submitBtn);
        });

        // Real-time validation
        const inputs = form?.querySelectorAll('input, textarea, select');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    async handleFormSubmission(form, submitBtn) {
        try {
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Validate form
            if (!this.validateForm(form)) {
                throw new Error('Please fill in all required fields correctly.');
            }

            // Prepare form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Submit form
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccessMessage(result.message);
                form.reset();
                this.clearAllFieldErrors(form);
            } else {
                throw new Error(result.message || 'Failed to send message');
            }

        } catch (error) {
            this.showErrorMessage(error.message);
        } finally {
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if required field is empty
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Show/hide error
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = 'var(--danger-red)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger-red);
            font-size: 0.75rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }

    clearAllFieldErrors(form) {
        const errorDivs = form.querySelectorAll('.field-error');
        errorDivs.forEach(div => div.remove());
        
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);

        // Show message
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);

        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }, 5000);
    }

    // 3D Tilt Effect
    initTiltEffect() {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                this.handleTilt(e, element);
            });

            element.addEventListener('mouseleave', () => {
                this.resetTilt(element);
            });
        });
    }

    handleTilt(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        element.style.transform = `
            perspective(1000px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            translateZ(20px)
        `;
    }

    resetTilt(element) {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }

    updateTiltEffects() {
        // Reset tilt effects on resize
        const tiltElements = document.querySelectorAll('[data-tilt]');
        tiltElements.forEach(element => {
            this.resetTilt(element);
        });
    }

    // Scroll Effects
    initScrollEffects() {
        // Parallax effect for background elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            const bgGrid = document.querySelector('.bg-grid');
            if (bgGrid) {
                bgGrid.style.transform = `translateY(${rate}px)`;
            }
        });

        // Smooth reveal animations
        this.initRevealAnimations();
    }

    // Unconventional Features
    initUnconventionalFeatures() {
        this.initFloatingCursor();
        this.initKeyboardShortcuts();
        this.initEasterEggs();
        this.addSectionDividers();
    }

    initFloatingCursor() {
        // Create floating cursor element
        const cursor = document.createElement('div');
        cursor.className = 'floating-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor follow animation
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        };

        animateCursor();

        // Cursor interactions
        const interactiveElements = document.querySelectorAll('a, button, .service-card, .nav-orb');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'rgba(154, 205, 50, 0.6)';
            });

            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'rgba(154, 205, 50, 0.3)';
            });
        });
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Navigate with arrow keys
            if (e.altKey) {
                switch(e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.scrollToSection('hero');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.scrollToSection('contact');
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateToPreviousSection();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateToNextSection();
                        break;
                }
            }

            // Quick contact form focus
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                this.scrollToSection('contact');
                setTimeout(() => {
                    document.getElementById('name')?.focus();
                }, 500);
            }
        });
    }

    navigateToPreviousSection() {
        const sections = ['hero', 'services', 'about', 'contact'];
        const currentSection = this.getCurrentSection();
        const currentIndex = sections.indexOf(currentSection);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        this.scrollToSection(sections[previousIndex]);
    }

    navigateToNextSection() {
        const sections = ['hero', 'services', 'about', 'contact'];
        const currentSection = this.getCurrentSection();
        const currentIndex = sections.indexOf(currentSection);
        const nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        this.scrollToSection(sections[nextIndex]);
    }

    getCurrentSection() {
        const sections = ['hero', 'services', 'about', 'contact'];
        const scrollPosition = window.scrollY + 100;
        let currentSection = 'hero';

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && scrollPosition >= section.offsetTop) {
                currentSection = sectionId;
            }
        });

        return currentSection;
    }

    initEasterEggs() {
        let konamiCode = [];
        const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);
            
            // Keep only the last 10 keys
            if (konamiCode.length > 10) {
                konamiCode = konamiCode.slice(-10);
            }
            
            // Check if konami code matches
            if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
                this.activateMatrixMode();
                konamiCode = []; // Reset
            }
        });

        // Double-click on logo for surprise
        const logo = document.querySelector('.logo');
        let logoClickCount = 0;
        logo?.addEventListener('click', () => {
            logoClickCount++;
            if (logoClickCount === 2) {
                this.activateGlitchMode();
                logoClickCount = 0;
            }
            setTimeout(() => logoClickCount = 0, 500);
        });
    }

    activateMatrixMode() {
        // Add matrix effect to background
        const matrixCanvas = document.createElement('canvas');
        matrixCanvas.className = 'matrix-bg';
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        document.body.appendChild(matrixCanvas);

        const ctx = matrixCanvas.getContext('2d');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()';
        const fontSize = 14;
        const columns = matrixCanvas.width / fontSize;
        const drops = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 11, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            
            ctx.fillStyle = '#9ACD32';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const matrixInterval = setInterval(draw, 35);
        
        // Remove after 10 seconds
        setTimeout(() => {
            clearInterval(matrixInterval);
            matrixCanvas.remove();
            this.showMessage('Matrix mode deactivated! 🎬', 'success');
        }, 10000);
        
        this.showMessage('Matrix mode activated! 🔴💊', 'success');
    }

    activateGlitchMode() {
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            const originalText = title.textContent;
            title.setAttribute('data-text', originalText);
            title.classList.add('glitch-text');
            
            setTimeout(() => {
                title.classList.remove('glitch-text');
                title.removeAttribute('data-text');
            }, 3000);
        });
        
        this.showMessage('Glitch mode activated! ⚡💀', 'success');
    }

    addSectionDividers() {
        const sections = document.querySelectorAll('section:not(.hero)');
        sections.forEach(section => {
            const divider = document.createElement('div');
            divider.className = 'section-divider';
            section.parentNode.insertBefore(divider, section);
        });
    }

    initRevealAnimations() {
        const revealElements = document.querySelectorAll(
            '.hero-content, .section-title, .section-subtitle'
        );

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(element);
        });
    }
}

// Global functions for external use
window.scrollToSection = function(sectionId) {
    const app = window.ctInfosecApp;
    if (app) {
        app.scrollToSection(sectionId);
    }
};

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ctInfosecApp = new CTInfosecApp();
});

// Performance optimization
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Initialize non-critical features
        console.log('CT Infosec website loaded successfully');
    });
}

// Service Worker registration for PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be implemented later for caching
        console.log('Service worker support detected');
    });
}

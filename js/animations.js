// CT Infosec - Advanced Animations Controller
class AnimationController {
    constructor() {
        this.isInitialized = false;
        this.animationQueue = [];
        this.activeAnimations = new Map();
        this.preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupIntersectionObserver();
        this.initPageLoadAnimations();
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initTextAnimations();
        this.initBackgroundAnimations();
        
        this.isInitialized = true;
        console.log('Animation controller initialized');
    }
    
    // Intersection Observer for scroll-triggered animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0.1, 0.3, 0.7],
            rootMargin: '-10% 0px -10% 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target, entry.intersectionRatio);
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, ' +
            '.service-card, .course-card, .team-member, .stat-item, ' +
            '.testimonial-slide, .feature-item, .step-item'
        );
        
        animatedElements.forEach(el => this.observer.observe(el));
    }
    
    // Page load animations
    initPageLoadAnimations() {
        // Hero title animation
        this.animateHeroTitle();
        
        // Navigation slide in
        this.animateNavigation();
        
        // Logo animation
        this.animateLogo();
        
        // Initial page fade in
        this.animatePageFadeIn();
    }
    
    animateHeroTitle() {
        const titleLines = document.querySelectorAll('.title-line');
        if (titleLines.length === 0) return;
        
        titleLines.forEach((line, index) => {
            setTimeout(() => {
                this.animateElement(line, 'title-reveal', {
                    duration: 800,
                    delay: index * 100,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
            }, 100);
        });
    }
    
    animateNavigation() {
        const nav = document.querySelector('.nav-container');
        if (!nav) return;
        
        nav.style.transform = 'translateY(-100%)';
        nav.style.opacity = '0';
        
        setTimeout(() => {
            nav.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            nav.style.transform = 'translateY(0)';
            nav.style.opacity = '1';
        }, 200);
    }
    
    animateLogo() {
        const logo = document.querySelector('.logo');
        if (!logo) return;
        
        logo.style.transform = 'rotate(-180deg) scale(0)';
        logo.style.opacity = '0';
        
        setTimeout(() => {
            logo.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            logo.style.transform = 'rotate(0deg) scale(1)';
            logo.style.opacity = '1';
        }, 500);
    }
    
    animatePageFadeIn() {
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
    
    // Scroll-triggered animations
    initScrollAnimations() {
        this.initParallaxElements();
        this.initCounterAnimations();
        this.initProgressAnimations();
    }
    
    initParallaxElements() {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        window.addEventListener('scroll', () => {
            if (this.preferReducedMotion) return;
            
            const scrollY = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollY * speed);
                
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    initCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number, .counter');
        
        counters.forEach(counter => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }
    
    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const start = Date.now();
        const suffix = element.textContent.replace(/\d/g, '');
        
        const updateCounter = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    }
    
    initProgressAnimations() {
        const progressBars = document.querySelectorAll('.progress-bar, .skill-bar');
        
        progressBars.forEach(bar => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgressBar(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(bar);
        });
    }
    
    animateProgressBar(bar) {
        const width = bar.dataset.width || '0%';
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    }
    
    // Hover animations
    initHoverAnimations() {
        this.initCardHoverEffects();
        this.initButtonHoverEffects();
        this.initImageHoverEffects();
    }
    
    initCardHoverEffects() {
        const cards = document.querySelectorAll('.service-card, .course-card, .team-member');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (this.preferReducedMotion) return;
                
                this.animateElement(card, 'card-hover-in', {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                // Animate child elements
                const children = card.querySelectorAll('.service-icon, .course-icon, h3, p');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.transform = 'translateY(-2px)';
                        child.style.transition = 'transform 0.2s ease';
                    }, index * 50);
                });
            });
            
            card.addEventListener('mouseleave', () => {
                if (this.preferReducedMotion) return;
                
                this.animateElement(card, 'card-hover-out', {
                    duration: 300,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                // Reset child elements
                const children = card.querySelectorAll('.service-icon, .course-icon, h3, p');
                children.forEach(child => {
                    child.style.transform = 'translateY(0)';
                });
            });
        });
    }
    
    initButtonHoverEffects() {
        const buttons = document.querySelectorAll('.cta-button, .submit-btn, .carousel-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (this.preferReducedMotion) return;
                
                // Create ripple effect
                this.createRippleEffect(button);
                
                // Scale animation
                button.style.transform = 'translateY(-2px) scale(1.02)';
                button.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    initImageHoverEffects() {
        const images = document.querySelectorAll('.course-image img, .training-image img');
        
        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                if (this.preferReducedMotion) return;
                
                img.style.transform = 'scale(1.05)';
                img.style.transition = 'transform 0.3s ease';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
        });
    }
    
    // Text animations
    initTextAnimations() {
        this.initTypewriterEffect();
        this.initTextRevealAnimation();
        this.initGlitchEffect();
    }
    
    initTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-color)';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                element.textContent += text[i];
                i++;
                
                if (i === text.length) {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            }, 50);
        });
    }
    
    initTextRevealAnimation() {
        const revealElements = document.querySelectorAll('.text-reveal');
        
        revealElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateTextReveal(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });
    }
    
    animateTextReveal(element) {
        const text = element.textContent;
        const words = text.split(' ');
        element.innerHTML = '';
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px)';
            span.style.display = 'inline-block';
            span.style.transition = 'all 0.5s ease';
            element.appendChild(span);
            
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    initGlitchEffect() {
        const glitchElements = document.querySelectorAll('.glitch');
        
        glitchElements.forEach(element => {
            element.dataset.text = element.textContent;
            
            element.addEventListener('mouseenter', () => {
                element.classList.add('glitch-active');
                setTimeout(() => {
                    element.classList.remove('glitch-active');
                }, 500);
            });
        });
    }
    
    // Background animations
    initBackgroundAnimations() {
        this.initMatrixEffect();
        this.initParticleBackground();
        this.initCyberGrid();
    }
    
    initMatrixEffect() {
        const matrixContainers = document.querySelectorAll('.matrix-bg');
        
        matrixContainers.forEach(container => {
            this.createMatrixRain(container);
        });
    }
    
    createMatrixRain(container) {
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const columns = Math.floor(container.offsetWidth / 14);
        
        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = i * 14 + 'px';
            column.style.animationDelay = Math.random() * 5 + 's';
            
            // Generate random characters
            for (let j = 0; j < 20; j++) {
                const char = characters[Math.floor(Math.random() * characters.length)];
                column.textContent += char;
            }
            
            container.appendChild(column);
        }
    }
    
    initParticleBackground() {
        const particleContainers = document.querySelectorAll('.particle-bg');
        
        particleContainers.forEach(container => {
            this.createParticleBackground(container);
        });
    }
    
    createParticleBackground(container) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'bg-particle';
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 1 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = 'var(--primary-color)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particle.style.animation = `float-bg ${Math.random() * 10 + 5}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            container.appendChild(particle);
        }
    }
    
    initCyberGrid() {
        const gridContainers = document.querySelectorAll('.cyber-grid');
        
        gridContainers.forEach(container => {
            container.style.backgroundSize = '50px 50px';
            container.style.animation = 'grid-move 20s linear infinite';
        });
    }
    
    // Animation utilities
    triggerAnimation(element, intersectionRatio) {
        if (element.classList.contains('revealed')) return;
        
        element.classList.add('revealed');
        
        // Stagger child animations
        const children = element.querySelectorAll('.stagger-animation');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('revealed');
            }, index * 100);
        });
    }
    
    animateElement(element, animationName, options = {}) {
        const {
            duration = 300,
            delay = 0,
            easing = 'ease',
            fillMode = 'forwards'
        } = options;
        
        element.style.animation = `${animationName} ${duration}ms ${easing} ${delay}ms ${fillMode}`;
        
        return new Promise(resolve => {
            setTimeout(resolve, duration + delay);
        });
    }
    
    // Public methods
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
    }
    
    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.activeAnimations.clear();
        this.animationQueue = [];
        this.isInitialized = false;
    }
}

// Additional animation keyframes
function addAnimationKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes float-bg {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
            }
        }
        
        @keyframes card-hover-in {
            from {
                transform: translateY(0) scale(1);
            }
            to {
                transform: translateY(-8px) scale(1.02);
            }
        }
        
        @keyframes card-hover-out {
            from {
                transform: translateY(-8px) scale(1.02);
            }
            to {
                transform: translateY(0) scale(1);
            }
        }
        
        .glitch-active {
            animation: cyber-glitch 0.3s ease-in-out 3;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize animation controller
document.addEventListener('DOMContentLoaded', function() {
    addAnimationKeyframes();
    window.animationController = new AnimationController();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}

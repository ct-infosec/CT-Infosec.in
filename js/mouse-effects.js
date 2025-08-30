// CT Infosec - Mouse Effects and Interactive Elements
class MouseEffects {
    constructor() {
        this.mouse = { x: 0, y: 0 };
        this.cursorDot = null;
        this.cursorOutline = null;
        this.particles = [];
        this.followers = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.createCustomCursor();
        this.createParticleSystem();
        this.createMouseFollowers();
        this.bindEvents();
        this.startAnimationLoop();
        
        this.isInitialized = true;
        console.log('Mouse effects initialized');
    }
    
    createCustomCursor() {
        this.cursorDot = document.getElementById('cursor-dot');
        this.cursorOutline = document.getElementById('cursor-outline');
        
        if (!this.cursorDot || !this.cursorOutline) {
            console.warn('Cursor elements not found');
            return;
        }
        
        // Hide cursor on touch devices
        if ('ontouchstart' in window) {
            this.cursorDot.style.display = 'none';
            this.cursorOutline.style.display = 'none';
            document.body.style.cursor = 'auto';
            return;
        }
    }
    
    createParticleSystem() {
        const particleContainer = document.getElementById('particle-system');
        if (!particleContainer) return;
        
        // Create initial particles
        for (let i = 0; i < 50; i++) {
            this.createParticle(particleContainer);
        }
    }
    
    createParticle(container, x = null, y = null) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size variation
        const size = Math.random();
        if (size < 0.3) {
            particle.classList.add('small');
        } else if (size > 0.7) {
            particle.classList.add('large');
        }
        
        // Position
        particle.style.left = (x !== null ? x : Math.random() * window.innerWidth) + 'px';
        particle.style.top = (y !== null ? y : Math.random() * window.innerHeight) + 'px';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        container.appendChild(particle);
        
        // Store particle data
        const particleData = {
            element: particle,
            x: parseFloat(particle.style.left),
            y: parseFloat(particle.style.top),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 1.0,
            decay: 0.005 + Math.random() * 0.005
        };
        
        this.particles.push(particleData);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            this.particles = this.particles.filter(p => p.element !== particle);
        }, 8000);
        
        return particleData;
    }
    
    createMouseFollowers() {
        const followerContainer = document.body;
        
        // Create multiple followers with different sizes and delays
        const followerConfigs = [
            { size: 60, delay: 0.1, opacity: 0.3, className: 'follower-large' },
            { size: 30, delay: 0.15, opacity: 0.5, className: 'follower-medium' },
            { size: 15, delay: 0.2, opacity: 0.7, className: 'follower-small' }
        ];
        
        followerConfigs.forEach((config, index) => {
            const follower = document.createElement('div');
            follower.className = `mouse-follower ${config.className}`;
            follower.style.width = config.size + 'px';
            follower.style.height = config.size + 'px';
            follower.style.opacity = config.opacity;
            follower.style.position = 'fixed';
            follower.style.pointerEvents = 'none';
            follower.style.zIndex = 2 - index;
            follower.style.border = '1px solid rgba(154, 255, 0, 0.3)';
            follower.style.borderRadius = '50%';
            follower.style.transform = 'translate(-50%, -50%)';
            follower.style.transition = `all ${config.delay}s ease`;
            
            followerContainer.appendChild(follower);
            
            this.followers.push({
                element: follower,
                delay: config.delay,
                x: 0,
                y: 0
            });
        });
    }
    
    bindEvents() {
        // Mouse move tracking
        document.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
            this.updateCursor(e);
            this.updateFollowers(e);
            this.handleMouseTrail(e);
        });
        
        // Mouse enter/leave for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .service-card, .course-card, .nav-link');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => this.onElementHover(element, true));
            element.addEventListener('mouseleave', () => this.onElementHover(element, false));
        });
        
        // Click effects
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });
        
        // Scroll effects
        window.addEventListener('scroll', () => {
            this.handleScrollEffects();
        });
        
        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    updateMousePosition(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    updateCursor(e) {
        if (!this.cursorDot || !this.cursorOutline) return;
        
        // Update cursor dot position immediately
        this.cursorDot.style.left = e.clientX + 'px';
        this.cursorDot.style.top = e.clientY + 'px';
        
        // Update cursor outline with slight delay
        setTimeout(() => {
            this.cursorOutline.style.left = e.clientX + 'px';
            this.cursorOutline.style.top = e.clientY + 'px';
        }, 50);
    }
    
    updateFollowers(e) {
        this.followers.forEach(follower => {
            // Use requestAnimationFrame for smooth animation
            requestAnimationFrame(() => {
                follower.element.style.left = e.clientX + 'px';
                follower.element.style.top = e.clientY + 'px';
            });
        });
    }
    
    onElementHover(element, isHovering) {
        if (!this.cursorDot || !this.cursorOutline) return;
        
        if (isHovering) {
            // Enlarge cursor on hover
            this.cursorDot.style.transform = 'scale(2)';
            this.cursorOutline.style.transform = 'scale(1.5)';
            this.cursorOutline.style.opacity = '1';
            
            // Add glow effect to element
            element.style.boxShadow = '0 0 20px rgba(154, 255, 0, 0.3)';
            
            // Tilt effect for cards
            if (element.classList.contains('service-card') || element.classList.contains('course-card')) {
                this.addTiltEffect(element);
            }
        } else {
            // Reset cursor
            this.cursorDot.style.transform = 'scale(1)';
            this.cursorOutline.style.transform = 'scale(1)';
            this.cursorOutline.style.opacity = '0.5';
            
            // Remove glow effect
            element.style.boxShadow = '';
            
            // Remove tilt effect
            if (element.classList.contains('service-card') || element.classList.contains('course-card')) {
                this.removeTiltEffect(element);
            }
        }
    }
    
    addTiltEffect(element) {
        element.addEventListener('mousemove', this.handleTilt);
        element.style.transition = 'transform 0.1s ease';
    }
    
    removeTiltEffect(element) {
        element.removeEventListener('mousemove', this.handleTilt);
        element.style.transform = '';
        element.style.transition = 'transform 0.3s ease';
    }
    
    handleTilt = (e) => {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    }
    
    handleMouseTrail(e) {
        // Create particle trail effect
        if (Math.random() < 0.3) { // 30% chance to create particle
            const particleContainer = document.getElementById('particle-system');
            if (particleContainer) {
                this.createParticle(particleContainer, e.clientX, e.clientY);
            }
        }
    }
    
    createClickEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '4px';
        ripple.style.height = '4px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'var(--primary-color)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '10000';
        ripple.style.animation = 'ripple-effect 0.6s ease-out forwards';
        
        document.body.appendChild(ripple);
        
        // Add ripple animation keyframes if not exists
        if (!document.getElementById('ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple-effect {
                    to {
                        transform: translate(-50%, -50%) scale(20);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    handleScrollEffects() {
        const scrollY = window.scrollY;
        
        // Parallax effect for particles
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                const parallaxSpeed = 0.5;
                const newY = particle.y + (scrollY * parallaxSpeed);
                particle.element.style.transform = `translateY(${newY - particle.y}px)`;
            }
        });
        
        // Update interactive elements based on scroll
        this.updateElementsOnScroll(scrollY);
    }
    
    updateElementsOnScroll(scrollY) {
        const cards = document.querySelectorAll('.service-card, .course-card, .team-member');
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                const transform = Math.max(0, Math.min(1, progress));
                
                // Subtle floating animation based on scroll
                const floatY = Math.sin(scrollY * 0.01 + index) * 2;
                card.style.transform = `translateY(${floatY}px)`;
            }
        });
    }
    
    startAnimationLoop() {
        const animate = () => {
            this.updateParticles();
            this.updateFloatingElements();
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            if (!particle.element.parentNode) {
                this.particles.splice(index, 1);
                return;
            }
            
            // Update particle position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            // Apply mouse repulsion
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.01;
                particle.vy -= (dy / distance) * force * 0.01;
            }
            
            // Update element
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.life;
            
            // Remove dead particles
            if (particle.life <= 0) {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateFloatingElements() {
        const floatingElements = document.querySelectorAll('.cyber-shield, .hero-visual, .floating-elements');
        const time = Date.now() * 0.001;
        
        floatingElements.forEach((element, index) => {
            const floatY = Math.sin(time + index) * 3;
            const floatX = Math.cos(time * 0.7 + index) * 2;
            
            if (element.style.transform) {
                // Preserve existing transforms and add floating
                const existingTransform = element.style.transform;
                if (!existingTransform.includes('translate3d')) {
                    element.style.transform += ` translate3d(${floatX}px, ${floatY}px, 0)`;
                }
            } else {
                element.style.transform = `translate3d(${floatX}px, ${floatY}px, 0)`;
            }
        });
    }
    
    handleResize() {
        // Update particle positions on resize
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
    }
    
    destroy() {
        // Clean up event listeners and elements
        this.particles.forEach(particle => {
            if (particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.followers.forEach(follower => {
            if (follower.element.parentNode) {
                follower.element.parentNode.removeChild(follower.element);
            }
        });
        
        this.particles = [];
        this.followers = [];
        this.isInitialized = false;
    }
}

// Initialize mouse effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on non-touch devices
    if (!('ontouchstart' in window)) {
        window.mouseEffects = new MouseEffects();
    }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MouseEffects;
}

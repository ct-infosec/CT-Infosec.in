# replit.md

## Overview

CT Infosec is a modern cybersecurity company website built as a static multi-page application. The site showcases the company's cybersecurity services, training programs, and expertise through a futuristic, interactive design. CT Infosec is a registered MSME (Micro, Small & Medium Enterprise) specializing in data and information security services, offering solutions across Government, BFSI, Manufacturing, and Healthcare sectors.

The website features five main pages (Home, Services, Training, About, Contact) with advanced visual effects including particle systems, custom mouse cursors, scroll animations, and interactive elements designed to convey technical expertise and cutting-edge cybersecurity capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a traditional multi-page static website architecture using vanilla web technologies:

**Technology Stack:**
- Pure HTML5 for semantic structure and content
- CSS3 with custom properties for theming and advanced animations
- Vanilla JavaScript for interactivity and dynamic effects
- No frameworks or build tools - direct browser execution

**Design System:**
- Dark theme with lime green (#9AFF00) accent color scheme
- CSS custom properties for consistent theming and easy maintenance
- Modular CSS architecture with separate files for base styles and animations
- Responsive design supporting mobile, tablet, and desktop viewports

**File Organization:**
- Root-level HTML pages for each major section
- CSS files organized by purpose (styles.css for base, animations.css for effects)
- JavaScript modules split by functionality (main.js, animations.js, mouse-effects.js)
- Assets directory for images and static resources

### Interactive Features Architecture
The site implements several advanced interactive systems:

**Mouse Effects System:**
- Custom cursor replacement with animated dot and outline elements
- Particle system with floating elements that respond to user interaction
- Mouse follower elements that create trailing effects
- Touch device detection to disable effects on mobile

**Animation Controller:**
- Intersection Observer API for scroll-triggered animations
- Staggered reveal animations for content sections
- Performance-conscious animation queue system
- Reduced motion support for accessibility

**Navigation System:**
- Responsive navigation with mobile hamburger menu
- Scroll-based navigation state changes
- Active page highlighting
- Smooth scrolling between sections

### Content Structure
The website is organized into distinct functional areas:

**Page Architecture:**
- index.html: Hero section with company tagline and core messaging
- services.html: Detailed service offerings (VAPT, DFIR, compliance)
- training.html: Educational programs and certification courses
- about.html: Company credentials and team information
- contact.html: Contact forms and business information

**Component Reusability:**
- Shared navigation component across all pages
- Consistent page header structure
- Reusable card components for services and training programs
- Common footer and contact information sections

## External Dependencies

### Font Services
- Google Fonts API for Inter and Space Mono typefaces
- Provides both regular weight variations and monospace fonts for technical content

### Icon Library
- Font Awesome 6.4.0 CDN for consistent iconography
- Used throughout the site for service icons, social media, and UI elements

### Browser APIs
- Intersection Observer API for scroll-based animations and lazy loading
- RequestAnimationFrame for smooth particle system animations
- CSS Custom Properties for dynamic theming
- Media Query API for responsive design and reduced motion preferences

### Performance Considerations
- Preconnect hints for external font services to improve loading performance
- CSS and JavaScript files hosted locally for faster delivery
- Optimized particle system with requestAnimationFrame for smooth 60fps animations
- Responsive images and lazy loading for content sections

The architecture prioritizes performance, accessibility, and maintainability while delivering a visually impressive user experience that reflects the company's technical cybersecurity expertise.
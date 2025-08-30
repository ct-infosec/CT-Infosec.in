# Overview

CT Infosec is a cybersecurity services website for a registered MSME (Micro, Small & Medium Enterprise) specializing in data and information security. The website showcases their core services including vulnerability assessment, penetration testing, digital forensics, incident response, and compliance management. Built with a modern, futuristic design aesthetic, the site serves as both a marketing platform and contact portal for potential clients seeking cybersecurity solutions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: Vanilla HTML, CSS, and JavaScript with no frontend frameworks
- **Design Pattern**: Single-page application with section-based navigation using smooth scrolling
- **Styling Approach**: CSS custom properties for consistent theming with a dark, futuristic aesthetic
- **Typography**: Uses JetBrains Mono for code/technical elements and Inter for body text
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox layouts
- **Animation System**: Custom JavaScript classes for scroll-triggered animations and interactive elements

## Backend Architecture
- **Framework**: Flask (Python) with SQLAlchemy ORM for database operations
- **Application Structure**: Modular design separating concerns:
  - `app.py`: Application factory and configuration
  - `models.py`: Database models and schema definitions
  - `routes.py`: Request handling and API endpoints
- **Database Pattern**: Single model approach for contact form submissions with timestamp tracking
- **Error Handling**: Centralized exception handling with proper HTTP status codes and user-friendly messages

## Data Storage
- **Development Database**: SQLite for local development (ctinfosec.db)
- **Production Ready**: Configurable via DATABASE_URL environment variable for PostgreSQL or other SQL databases
- **ORM Configuration**: SQLAlchemy with connection pooling and ping checks for reliability
- **Schema Design**: Simple contact submission model capturing client inquiries with company information and service interests

## API Design
- **Contact Endpoint**: Single POST route `/contact` accepting both JSON and form data
- **Validation**: Server-side email format validation and required field checking
- **Response Format**: Consistent JSON responses with success/error status and user messages
- **Content Type Support**: Handles both application/json and form-encoded data for flexibility

# External Dependencies

## Python Packages
- **Flask**: Web framework for request handling and templating
- **Flask-SQLAlchemy**: Database ORM integration
- **Werkzeug**: WSGI utilities and middleware for proxy support

## Frontend Libraries
- **Google Fonts**: JetBrains Mono and Inter font families for typography
- **Font Awesome 6.4.0**: Icon library for UI elements via CDN

## Development Tools
- **Environment Configuration**: Uses environment variables for database URL and session secrets
- **Logging**: Python's built-in logging module for application monitoring
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

## Infrastructure Requirements
- **Database**: SQL-compatible database (SQLite for development, PostgreSQL recommended for production)
- **Environment Variables**: 
  - `DATABASE_URL`: Database connection string
  - `SESSION_SECRET`: Flask session encryption key
- **Static Assets**: Local hosting of images, CSS, and JavaScript files
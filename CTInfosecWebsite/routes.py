from flask import render_template, request, jsonify, redirect, url_for, flash
from flask_login import current_user, login_required
from app import app, db
from models import ContactSubmission, Course, Enrollment, User, Subscription
from auth import auth_bp
from dashboard import dashboard_bp
from courses import courses_bp
from payments import payments_bp
import logging
import re

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(payments_bp)

@app.route('/')
def index():
    # Get featured courses for homepage
    featured_courses = Course.query.filter(Course.is_active == True).limit(6).all()
    
    return render_template('index.html', featured_courses=featured_courses)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'GET':
        return render_template('contact.html')
        
    # Handle POST request
    try:
        data = request.get_json() if request.is_json else request.form
        
        # Validate required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        if not all([name, email, message]):
            return jsonify({'success': False, 'message': 'All required fields must be filled'}), 400
        
        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({'success': False, 'message': 'Please enter a valid email address'}), 400
        
        # Create new contact submission
        submission = ContactSubmission(
            name=name,
            email=email,
            company=data.get('company', ''),
            message=message,
            service_interest=data.get('service_interest', '')
        )
        
        db.session.add(submission)
        db.session.commit()
        
        app.logger.info(f"New contact submission from {name} ({email})")
        
        success_msg = f'Thank you, {name}! Your message has been received. We will get back to you within 24 hours.'
        
        if request.is_json:
            return jsonify({'success': True, 'message': success_msg})
        else:
            flash(success_msg, 'success')
            return redirect(url_for('contact'))
        
    except Exception as e:
        logging.error(f'Contact form error: {str(e)}')
        db.session.rollback()
        
        error_msg = 'Sorry, there was an error processing your message. Please try again.'
        if request.is_json:
            return jsonify({'success': False, 'message': error_msg}), 500
        flash(error_msg, 'error')
        return redirect(url_for('contact'))

# Admin route to create sample courses (remove in production)
@app.route('/admin/create-sample-courses')
def create_sample_courses():
    if not current_user.is_authenticated or not current_user.is_admin:
        return 'Access denied', 403
    
    # Check if courses already exist
    if Course.query.count() > 0:
        return 'Sample courses already exist'
    
    try:
        courses_data = [
            {
                'title': 'Cybersecurity Fundamentals',
                'slug': 'cybersecurity-fundamentals',
                'description': 'Master the essential concepts of cybersecurity including threat analysis, risk management, and security frameworks. Perfect for beginners looking to start their cybersecurity journey.',
                'category': 'Cybersecurity',
                'level': 'Beginner',
                'price': 99.99,
                'duration_hours': 20,
                'instructor_name': 'Dr. Sarah Mitchell',
                'prerequisites': 'Basic computer knowledge',
                'learning_outcomes': 'Understand security principles, identify common threats, implement basic security measures'
            },
            {
                'title': 'Advanced Penetration Testing',
                'slug': 'advanced-penetration-testing',
                'description': 'Deep dive into advanced penetration testing techniques, vulnerability assessment, and exploit development. Includes hands-on labs and real-world scenarios.',
                'category': 'Penetration Testing',
                'level': 'Advanced',
                'price': 299.99,
                'duration_hours': 40,
                'instructor_name': 'Mark Johnson, CISSP',
                'prerequisites': 'Basic networking and security knowledge',
                'learning_outcomes': 'Perform comprehensive pen tests, create detailed reports, identify critical vulnerabilities',
                'is_premium': True
            },
            {
                'title': 'Digital Forensics Essentials',
                'slug': 'digital-forensics-essentials',
                'description': 'Learn the fundamentals of digital forensics including evidence collection, analysis techniques, and legal considerations for cybercrime investigations.',
                'category': 'Digital Forensics',
                'level': 'Intermediate',
                'price': 199.99,
                'duration_hours': 30,
                'instructor_name': 'Detective Lisa Chen',
                'prerequisites': 'Basic understanding of computer systems',
                'learning_outcomes': 'Collect digital evidence, analyze forensic artifacts, prepare court-ready reports'
            },
            {
                'title': 'Incident Response & DFIR',
                'slug': 'incident-response-dfir',
                'description': 'Comprehensive training on incident response procedures, digital forensics investigation techniques, and threat hunting methodologies.',
                'category': 'DFIR',
                'level': 'Advanced',
                'price': 349.99,
                'duration_hours': 45,
                'instructor_name': 'Captain Robert Taylor',
                'prerequisites': 'Experience with security tools and systems',
                'learning_outcomes': 'Lead incident response teams, conduct forensic investigations, implement DFIR processes',
                'is_premium': True
            },
            {
                'title': 'Malware Analysis Workshop',
                'slug': 'malware-analysis-workshop',
                'description': 'Hands-on malware analysis training covering static and dynamic analysis, reverse engineering, and malware detection techniques.',
                'category': 'Malware Analysis',
                'level': 'Advanced',
                'price': 249.99,
                'duration_hours': 35,
                'instructor_name': 'Alex Rodriguez, Security Researcher',
                'prerequisites': 'Programming knowledge and security fundamentals',
                'learning_outcomes': 'Analyze malware samples, reverse engineer threats, develop detection signatures'
            },
            {
                'title': 'Network Security Fundamentals',
                'slug': 'network-security-fundamentals',
                'description': 'Essential networking concepts for cybersecurity professionals including protocols, architecture, monitoring, and defense strategies.',
                'category': 'Networking',
                'level': 'Beginner',
                'price': 149.99,
                'duration_hours': 25,
                'instructor_name': 'Jennifer Walsh, CCNA',
                'prerequisites': 'Basic computer knowledge',
                'learning_outcomes': 'Understand network protocols, configure security devices, implement network monitoring'
            }
        ]
        
        for course_data in courses_data:
            course = Course(**course_data)
            db.session.add(course)
        
        db.session.commit()
        return f'Created {len(courses_data)} sample courses successfully!'
        
    except Exception as e:
        db.session.rollback()
        return f'Error creating courses: {str(e)}'

@app.route('/admin/make-admin/<email>')
def make_admin(email):
    # Simple admin creation - secure this in production
    user = User.query.filter_by(email=email).first()
    if user:
        user.is_admin = True
        db.session.commit()
        return f'User {email} is now an admin'
    return 'User not found'

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('index.html'), 500

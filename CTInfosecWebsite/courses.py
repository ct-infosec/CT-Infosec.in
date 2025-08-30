from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import current_user, login_required
from app import db
from models import Course, Enrollment, User
from sqlalchemy import or_, and_

courses_bp = Blueprint('courses', __name__, url_prefix='/courses')

@courses_bp.route('/')
def catalog():
    # Get filter parameters
    category = request.args.get('category', '')
    level = request.args.get('level', '')
    search = request.args.get('search', '')
    
    # Build query
    query = Course.query.filter(Course.is_active == True)
    
    if category:
        query = query.filter(Course.category == category)
    
    if level:
        query = query.filter(Course.level == level)
    
    if search:
        query = query.filter(or_(
            Course.title.ilike(f'%{search}%'),
            Course.description.ilike(f'%{search}%')
        ))
    
    courses = query.all()
    
    # Get unique categories and levels for filters
    categories = db.session.query(Course.category).filter(Course.is_active == True).distinct().all()
    categories = [cat[0] for cat in categories]
    
    levels = db.session.query(Course.level).filter(Course.is_active == True).distinct().all()
    levels = [level[0] for level in levels]
    
    # Check which courses the user is enrolled in (if logged in)
    enrolled_course_ids = []
    if current_user.is_authenticated:
        enrolled_course_ids = [e.course_id for e in current_user.enrollments if e.is_active]
    
    return render_template('courses/catalog.html',
                         courses=courses,
                         categories=categories,
                         levels=levels,
                         enrolled_course_ids=enrolled_course_ids,
                         current_category=category,
                         current_level=level,
                         current_search=search)

@courses_bp.route('/<slug>')
def course_detail(slug):
    course = Course.query.filter_by(slug=slug, is_active=True).first_or_404()
    
    # Check if user is enrolled
    is_enrolled = False
    enrollment = None
    if current_user.is_authenticated:
        enrollment = Enrollment.query.filter_by(
            user_id=current_user.id,
            course_id=course.id,
            is_active=True
        ).first()
        is_enrolled = enrollment is not None
    
    return render_template('courses/detail.html',
                         course=course,
                         is_enrolled=is_enrolled,
                         enrollment=enrollment)

@courses_bp.route('/<slug>/enroll', methods=['POST'])
@login_required
def enroll(slug):
    try:
        course = Course.query.filter_by(slug=slug, is_active=True).first_or_404()
        
        # Check if already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            user_id=current_user.id,
            course_id=course.id
        ).first()
        
        if existing_enrollment:
            if existing_enrollment.is_active:
                return jsonify({'success': False, 'message': 'You are already enrolled in this course'}), 400
            else:
                # Reactivate enrollment
                existing_enrollment.is_active = True
                db.session.commit()
                return jsonify({
                    'success': True,
                    'message': 'Successfully re-enrolled in the course!',
                    'redirect': url_for('dashboard.course_detail', course_id=course.id)
                })
        
        # For free courses, enroll directly
        if course.price == 0:
            enrollment = Enrollment(
                user_id=current_user.id,
                course_id=course.id
            )
            db.session.add(enrollment)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Successfully enrolled in {course.title}!',
                'redirect': url_for('dashboard.course_detail', course_id=course.id)
            })
        else:
            # For paid courses, redirect to payment
            return jsonify({
                'success': True,
                'message': 'Redirecting to payment...',
                'redirect': url_for('payments.course_checkout', course_id=course.id)
            })
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Enrollment failed. Please try again.'}), 500

@courses_bp.route('/api/search')
def api_search():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    courses = Course.query.filter(
        and_(
            Course.is_active == True,
            or_(
                Course.title.ilike(f'%{query}%'),
                Course.description.ilike(f'%{query}%'),
                Course.category.ilike(f'%{query}%')
            )
        )
    ).limit(10).all()
    
    results = []
    for course in courses:
        results.append({
            'id': course.id,
            'title': course.title,
            'slug': course.slug,
            'category': course.category,
            'level': course.level,
            'price': course.price,
            'thumbnail_url': course.thumbnail_url
        })
    
    return jsonify(results)
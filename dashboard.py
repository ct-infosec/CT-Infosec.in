from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import db
from models import Course, Enrollment, LessonProgress, Subscription
from sqlalchemy import desc

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/')
@login_required
def index():
    # Get user's enrolled courses
    enrollments = Enrollment.query.filter_by(user_id=current_user.id, is_active=True).all()
    
    # Get user's active subscription
    active_subscription = Subscription.query.filter_by(
        user_id=current_user.id, 
        status='active'
    ).filter(Subscription.end_date > db.func.now()).first()
    
    # Get recent lesson progress
    recent_progress = LessonProgress.query.join(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).order_by(desc(LessonProgress.last_watched_at)).limit(5).all()
    
    return render_template('dashboard/index.html', 
                         enrollments=enrollments,
                         subscription=active_subscription,
                         recent_progress=recent_progress)

@dashboard_bp.route('/courses')
@login_required
def my_courses():
    enrollments = Enrollment.query.filter_by(user_id=current_user.id, is_active=True).all()
    
    # Calculate progress for each enrollment
    for enrollment in enrollments:
        enrollment.progress_percentage = enrollment.calculate_progress()
    
    return render_template('dashboard/courses.html', enrollments=enrollments)

@dashboard_bp.route('/course/<int:course_id>')
@login_required
def course_detail(course_id):
    # Check if user is enrolled in this course
    enrollment = Enrollment.query.filter_by(
        user_id=current_user.id,
        course_id=course_id,
        is_active=True
    ).first()
    
    if not enrollment:
        flash('You are not enrolled in this course.', 'error')
        return redirect(url_for('courses.catalog'))
    
    course = enrollment.course
    
    # Get user's progress for each lesson
    lesson_progress = {lp.lesson_id: lp for lp in enrollment.lesson_progress}
    
    return render_template('dashboard/course_detail.html', 
                         course=course,
                         enrollment=enrollment,
                         lesson_progress=lesson_progress)

@dashboard_bp.route('/lesson/<int:lesson_id>')
@login_required
def lesson_view(lesson_id):
    from models import Lesson
    
    lesson = Lesson.query.get_or_404(lesson_id)
    
    # Check if user has access to this lesson
    enrollment = Enrollment.query.filter_by(
        user_id=current_user.id,
        course_id=lesson.module.course_id,
        is_active=True
    ).first()
    
    if not enrollment and not lesson.is_free:
        flash('You need to enroll in this course to access this lesson.', 'error')
        return redirect(url_for('courses.catalog'))
    
    # Get or create lesson progress
    progress = LessonProgress.query.filter_by(
        enrollment_id=enrollment.id if enrollment else None,
        lesson_id=lesson_id
    ).first()
    
    if not progress and enrollment:
        progress = LessonProgress(
            enrollment_id=enrollment.id,
            lesson_id=lesson_id
        )
        db.session.add(progress)
        db.session.commit()
    
    return render_template('dashboard/lesson.html', lesson=lesson, progress=progress)

@dashboard_bp.route('/lesson/<int:lesson_id>/progress', methods=['POST'])
@login_required
def update_lesson_progress(lesson_id):
    try:
        data = request.get_json()
        watch_time = data.get('watch_time', 0)
        is_completed = data.get('is_completed', False)
        
        # Find the lesson and enrollment
        from models import Lesson
        lesson = Lesson.query.get_or_404(lesson_id)
        
        enrollment = Enrollment.query.filter_by(
            user_id=current_user.id,
            course_id=lesson.module.course_id,
            is_active=True
        ).first()
        
        if not enrollment:
            return jsonify({'success': False, 'message': 'Not enrolled in this course'}), 403
        
        # Update or create progress
        progress = LessonProgress.query.filter_by(
            enrollment_id=enrollment.id,
            lesson_id=lesson_id
        ).first()
        
        if not progress:
            progress = LessonProgress(
                enrollment_id=enrollment.id,
                lesson_id=lesson_id
            )
            db.session.add(progress)
        
        progress.watch_time = max(progress.watch_time, watch_time)
        progress.last_watched_at = db.func.now()
        
        if is_completed and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = db.func.now()
        
        # Update enrollment progress
        enrollment.progress_percentage = enrollment.calculate_progress()
        
        # Check if course is completed
        if enrollment.progress_percentage >= 100 and not enrollment.completed_at:
            enrollment.completed_at = db.func.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'progress_percentage': enrollment.progress_percentage,
            'lesson_completed': progress.is_completed
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to update progress'}), 500

@dashboard_bp.route('/subscription')
@login_required
def subscription():
    active_subscription = Subscription.query.filter_by(
        user_id=current_user.id,
        status='active'
    ).filter(Subscription.end_date > db.func.now()).first()
    
    # Get subscription history
    subscription_history = Subscription.query.filter_by(
        user_id=current_user.id
    ).order_by(desc(Subscription.created_at)).all()
    
    return render_template('dashboard/subscription.html',
                         subscription=active_subscription,
                         history=subscription_history)
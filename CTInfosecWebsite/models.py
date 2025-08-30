from app import db
from datetime import datetime, timedelta
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    enrollments = db.relationship('Enrollment', backref='user', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user', lazy=True, cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'
    
    @property
    def has_active_subscription(self):
        active_sub = Subscription.query.filter_by(
            user_id=self.id, 
            status='active'
        ).filter(Subscription.end_date > datetime.utcnow()).first()
        return active_sub is not None
    
    def __repr__(self):
        return f'<User {self.email}>'

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)  # cyber security, digital forensics, etc.
    level = db.Column(db.String(50), nullable=False)  # beginner, intermediate, advanced
    price = db.Column(db.Float, nullable=False)
    duration_hours = db.Column(db.Integer, nullable=False)
    thumbnail_url = db.Column(db.String(500))
    trailer_url = db.Column(db.String(500))
    prerequisites = db.Column(db.Text)
    learning_outcomes = db.Column(db.Text)
    instructor_name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    modules = db.relationship('CourseModule', backref='course', lazy=True, cascade='all, delete-orphan', order_by='CourseModule.order_index')
    enrollments = db.relationship('Enrollment', backref='course', lazy=True, cascade='all, delete-orphan')
    
    @property
    def total_lessons(self):
        return sum(len(module.lessons) for module in self.modules)
    
    @property
    def enrollment_count(self):
        return len(self.enrollments)
    
    def __repr__(self):
        return f'<Course {self.title}>'

class CourseModule(db.Model):
    __tablename__ = 'course_modules'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order_index = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    lessons = db.relationship('Lesson', backref='module', lazy=True, cascade='all, delete-orphan', order_by='Lesson.order_index')
    
    def __repr__(self):
        return f'<CourseModule {self.title}>'

class Lesson(db.Model):
    __tablename__ = 'lessons'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('course_modules.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    video_duration = db.Column(db.Integer)  # in seconds
    content = db.Column(db.Text)  # additional text content
    resources = db.Column(db.Text)  # JSON string of downloadable resources
    order_index = db.Column(db.Integer, nullable=False)
    is_free = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    progress = db.relationship('LessonProgress', backref='lesson', lazy=True, cascade='all, delete-orphan')
    
    @property
    def resources_list(self):
        if self.resources:
            try:
                return json.loads(self.resources)
            except:
                return []
        return []
    
    def __repr__(self):
        return f'<Lesson {self.title}>'

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    progress_percentage = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    lesson_progress = db.relationship('LessonProgress', backref='enrollment', lazy=True, cascade='all, delete-orphan')
    
    @property
    def is_completed(self):
        return self.completed_at is not None
    
    def calculate_progress(self):
        total_lessons = self.course.total_lessons
        if total_lessons == 0:
            return 0.0
        
        completed_lessons = len([lp for lp in self.lesson_progress if lp.is_completed])
        return (completed_lessons / total_lessons) * 100
    
    def __repr__(self):
        return f'<Enrollment User:{self.user_id} Course:{self.course_id}>'

class LessonProgress(db.Model):
    __tablename__ = 'lesson_progress'
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    watch_time = db.Column(db.Integer, default=0)  # in seconds
    completed_at = db.Column(db.DateTime)
    last_watched_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<LessonProgress Enrollment:{self.enrollment_id} Lesson:{self.lesson_id}>'

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_type = db.Column(db.String(50), nullable=False)  # basic, premium, enterprise
    status = db.Column(db.String(50), nullable=False)  # active, cancelled, expired
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=False)
    stripe_subscription_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @property
    def is_active(self):
        return self.status == 'active' and self.end_date > datetime.utcnow()
    
    @property
    def days_remaining(self):
        if self.is_active:
            delta = self.end_date - datetime.utcnow()
            return delta.days
        return 0
    
    def __repr__(self):
        return f'<Subscription User:{self.user_id} Plan:{self.plan_type}>'

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(50), nullable=False)  # pending, completed, failed, refunded
    payment_type = db.Column(db.String(50), nullable=False)  # course, subscription
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'))
    stripe_payment_id = db.Column(db.String(100))
    stripe_session_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Payment {self.amount} {self.currency} - {self.status}>'

class ContactSubmission(db.Model):
    __tablename__ = 'contact_submissions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    service_interest = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ContactSubmission {self.name} - {self.email}>'
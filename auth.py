from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from app import db
from models import User, Subscription
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            data = request.get_json() if request.is_json else request.form
            
            # Validate required fields
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            phone = data.get('phone', '').strip()
            
            if not all([first_name, last_name, email, password]):
                return jsonify({'success': False, 'message': 'All required fields must be filled'}), 400
            
            # Validate email format
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return jsonify({'success': False, 'message': 'Please enter a valid email address'}), 400
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400
            
            # Create new user
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            # Auto-login after registration
            login_user(user)
            
            return jsonify({
                'success': True,
                'message': f'Welcome to CT Infosec Academy, {first_name}!',
                'redirect': url_for('dashboard.index')
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': 'Registration failed. Please try again.'}), 500
    
    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json() if request.is_json else request.form
            
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            remember_me = data.get('remember_me', False)
            
            if not email or not password:
                return jsonify({'success': False, 'message': 'Email and password are required'}), 400
            
            user = User.query.filter_by(email=email).first()
            
            if user and user.check_password(password):
                if not user.is_active:
                    return jsonify({'success': False, 'message': 'Your account has been deactivated'}), 400
                
                login_user(user, remember=remember_me)
                
                next_page = request.args.get('next')
                if next_page:
                    return jsonify({'success': True, 'redirect': next_page})
                
                return jsonify({
                    'success': True,
                    'message': f'Welcome back, {user.first_name}!',
                    'redirect': url_for('dashboard.index')
                })
            else:
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
                
        except Exception as e:
            return jsonify({'success': False, 'message': 'Login failed. Please try again.'}), 500
    
    return render_template('auth/login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

@auth_bp.route('/profile')
@login_required
def profile():
    return render_template('auth/profile.html', user=current_user)

@auth_bp.route('/update-profile', methods=['POST'])
@login_required
def update_profile():
    try:
        data = request.get_json() if request.is_json else request.form
        
        current_user.first_name = data.get('first_name', current_user.first_name)
        current_user.last_name = data.get('last_name', current_user.last_name)
        current_user.phone = data.get('phone', current_user.phone)
        
        # Handle password change if provided
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if current_password and new_password:
            if not current_user.check_password(current_password):
                return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400
            current_user.set_password(new_password)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to update profile'}), 500
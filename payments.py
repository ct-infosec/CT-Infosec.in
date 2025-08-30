from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import db
from models import Course, Payment, Enrollment, Subscription, User
import stripe
import os
from datetime import datetime, timedelta

payments_bp = Blueprint('payments', __name__, url_prefix='/payments')

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Get domain for redirect URLs
def get_domain():
    domain = os.environ.get('REPLIT_DEV_DOMAIN')
    if not domain and os.environ.get('REPLIT_DOMAINS'):
        domain = os.environ.get('REPLIT_DOMAINS').split(',')[0]
    return f'https://{domain}' if domain else 'http://localhost:5000'

@payments_bp.route('/course/<int:course_id>/checkout')
@login_required
def course_checkout(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Check if already enrolled
    existing_enrollment = Enrollment.query.filter_by(
        user_id=current_user.id,
        course_id=course_id,
        is_active=True
    ).first()
    
    if existing_enrollment:
        flash('You are already enrolled in this course.', 'info')
        return redirect(url_for('dashboard.course_detail', course_id=course_id))
    
    try:
        # Create Stripe checkout session
        domain = get_domain()
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': course.title,
                        'description': course.description[:500],
                        'images': [course.thumbnail_url] if course.thumbnail_url else [],
                    },
                    'unit_amount': int(course.price * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=domain + url_for('payments.success') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=domain + url_for('courses.course_detail', slug=course.slug),
            metadata={
                'course_id': course_id,
                'user_id': current_user.id,
                'payment_type': 'course'
            },
            customer_email=current_user.email,
            automatic_tax={'enabled': True},
        )
        
        # Create pending payment record
        payment = Payment(
            user_id=current_user.id,
            course_id=course_id,
            amount=course.price,
            currency='USD',
            status='pending',
            payment_type='course',
            stripe_session_id=checkout_session.id
        )
        db.session.add(payment)
        db.session.commit()
        
        return redirect(checkout_session.url, code=303)
        
    except Exception as e:
        flash('Payment setup failed. Please try again.', 'error')
        return redirect(url_for('courses.course_detail', slug=course.slug))

@payments_bp.route('/subscription/<plan_type>/checkout')
@login_required
def subscription_checkout(plan_type):
    # Define subscription plans
    plans = {
        'basic': {'name': 'Basic Plan', 'price': 29.99, 'duration_months': 1},
        'premium': {'name': 'Premium Plan', 'price': 199.99, 'duration_months': 12},
        'enterprise': {'name': 'Enterprise Plan', 'price': 499.99, 'duration_months': 12}
    }
    
    if plan_type not in plans:
        flash('Invalid subscription plan.', 'error')
        return redirect(url_for('index'))
    
    plan = plans[plan_type]
    
    # Check if user already has an active subscription
    active_sub = Subscription.query.filter_by(
        user_id=current_user.id,
        status='active'
    ).filter(Subscription.end_date > datetime.utcnow()).first()
    
    if active_sub:
        flash('You already have an active subscription.', 'info')
        return redirect(url_for('dashboard.subscription'))
    
    try:
        domain = get_domain()
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'CT Infosec Academy - {plan["name"]}',
                        'description': f'Access to all courses and premium content for {plan["duration_months"]} month(s)',
                    },
                    'unit_amount': int(plan['price'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=domain + url_for('payments.success') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=domain + url_for('dashboard.subscription'),
            metadata={
                'plan_type': plan_type,
                'user_id': current_user.id,
                'payment_type': 'subscription'
            },
            customer_email=current_user.email,
            automatic_tax={'enabled': True},
        )
        
        # Create pending payment record
        payment = Payment(
            user_id=current_user.id,
            amount=plan['price'],
            currency='USD',
            status='pending',
            payment_type='subscription',
            stripe_session_id=checkout_session.id
        )
        db.session.add(payment)
        db.session.commit()
        
        return redirect(checkout_session.url, code=303)
        
    except Exception as e:
        flash('Payment setup failed. Please try again.', 'error')
        return redirect(url_for('dashboard.subscription'))

@payments_bp.route('/success')
@login_required
def success():
    session_id = request.args.get('session_id')
    if not session_id:
        flash('Invalid payment session.', 'error')
        return redirect(url_for('dashboard.index'))
    
    try:
        # Retrieve the checkout session from Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        if checkout_session.payment_status == 'paid':
            # Find the payment record
            payment = Payment.query.filter_by(stripe_session_id=session_id).first()
            
            if payment and payment.status == 'pending':
                # Update payment status
                payment.status = 'completed'
                payment.completed_at = datetime.utcnow()
                payment.stripe_payment_id = checkout_session.payment_intent
                
                # Handle course enrollment
                if payment.payment_type == 'course' and payment.course_id:
                    # Create enrollment
                    enrollment = Enrollment(
                        user_id=payment.user_id,
                        course_id=payment.course_id
                    )
                    db.session.add(enrollment)
                    
                    course = Course.query.get(payment.course_id)
                    success_message = f'Successfully enrolled in {course.title}!'
                    redirect_url = url_for('dashboard.course_detail', course_id=course.id)
                
                # Handle subscription
                elif payment.payment_type == 'subscription':
                    # Determine subscription duration based on metadata
                    metadata = checkout_session.metadata
                    plan_type = metadata.get('plan_type', 'basic')
                    
                    duration_map = {
                        'basic': 1,
                        'premium': 12,
                        'enterprise': 12
                    }
                    
                    duration_months = duration_map.get(plan_type, 1)
                    
                    # Create subscription
                    subscription = Subscription(
                        user_id=payment.user_id,
                        plan_type=plan_type,
                        status='active',
                        start_date=datetime.utcnow(),
                        end_date=datetime.utcnow() + timedelta(days=30 * duration_months)
                    )
                    db.session.add(subscription)
                    payment.subscription_id = subscription.id
                    
                    success_message = f'Successfully subscribed to {plan_type.title()} Plan!'
                    redirect_url = url_for('dashboard.subscription')
                
                db.session.commit()
                flash(success_message, 'success')
                return redirect(redirect_url)
        
        flash('Payment verification failed.', 'error')
        return redirect(url_for('dashboard.index'))
        
    except Exception as e:
        flash('Payment processing failed. Please contact support.', 'error')
        return redirect(url_for('dashboard.index'))

@payments_bp.route('/cancel')
@login_required
def cancel():
    flash('Payment was cancelled.', 'info')
    return redirect(url_for('dashboard.index'))

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # You would need to set up a webhook endpoint secret in production
        # For now, we'll process the event without signature verification
        event = stripe.Event.construct_from(
            request.get_json(), stripe.api_key
        )
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Find and update payment
            payment = Payment.query.filter_by(stripe_session_id=session['id']).first()
            if payment and payment.status == 'pending':
                payment.status = 'completed'
                payment.completed_at = datetime.utcnow()
                db.session.commit()
        
        return {'status': 'success'}, 200
        
    except ValueError:
        return {'error': 'Invalid payload'}, 400
    except Exception as e:
        return {'error': 'Webhook handling failed'}, 500
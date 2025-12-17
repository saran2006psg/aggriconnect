from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.database import db
from app.models.user import User, UserRole, FarmerProfile, ConsumerProfile
from app.utils.security import hash_password, verify_password, generate_verification_token, verify_token
from app.utils.email import send_verification_email, send_password_reset_email
from authlib.integrations.requests_client import OAuth2Session
import requests

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'fullName', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({
                'success': False,
                'message': 'Missing required fields',
                'errors': [{'field': field, 'message': f'{field} is required'} for field in required_fields if field not in data]
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered',
                'errors': [{'field': 'email', 'message': 'Email already exists'}]
            }), 400
        
        # Validate role
        try:
            role = UserRole(data['role'])
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid role',
                'errors': [{'field': 'role', 'message': 'Role must be consumer, farmer, or admin'}]
            }), 400
        
        # Create user
        user = User(
            email=data['email'],
            password_hash=hash_password(data['password']),
            full_name=data['fullName'],
            role=role,
            phone_number=data.get('phoneNumber')
        )
        
        db.session.add(user)
        db.session.flush()
        
        # Create role-specific profile
        if role == UserRole.FARMER:
            farmer_profile = FarmerProfile(
                user_id=user.id,
                farm_name=data.get('farmName', f"{data['fullName']}'s Farm"),
                farm_location=data.get('farmLocation', ''),
                farm_description=data.get('farmDescription', '')
            )
            db.session.add(farmer_profile)
        elif role == UserRole.CONSUMER:
            consumer_profile = ConsumerProfile(
                user_id=user.id
            )
            db.session.add(consumer_profile)
        
        db.session.commit()
        
        # Generate verification token
        verification_token = generate_verification_token(user.id, expires_in=86400)
        verification_link = f"{current_app.config['FRONTEND_URL']}/verify-email?token={verification_token}"
        
        # Send verification email
        send_verification_email(user.email, user.full_name, verification_link)
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': user.to_dict(),
                'accessToken': access_token,
                'refreshToken': refresh_token
            },
            'errors': None
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required',
                'errors': None
            }), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.password_hash:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password',
                'errors': None
            }), 401
        
        # Verify password
        if not verify_password(data['password'], user.password_hash):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password',
                'errors': None
            }), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is disabled',
                'errors': None
            }), 403
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'accessToken': access_token,
                'refreshToken': refresh_token
            },
            'errors': None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login failed: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/google', methods=['POST'])
def google_login():
    """Login/Register with Google OAuth"""
    try:
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({
                'success': False,
                'message': 'Google token is required',
                'errors': None
            }), 400
        
        # Verify Google token
        google_user_info_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        headers = {'Authorization': f'Bearer {google_token}'}
        response = requests.get(google_user_info_url, headers=headers)
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'message': 'Invalid Google token',
                'errors': None
            }), 401
        
        google_user = response.json()
        
        # Check if user exists
        user = User.query.filter_by(oauth_provider='google', oauth_id=google_user['sub']).first()
        
        if not user:
            # Check if email exists
            user = User.query.filter_by(email=google_user['email']).first()
            
            if user:
                # Link OAuth to existing account
                user.oauth_provider = 'google'
                user.oauth_id = google_user['sub']
                user.is_email_verified = True
            else:
                # Create new user
                user = User(
                    email=google_user['email'],
                    full_name=google_user.get('name', google_user['email']),
                    role=UserRole(data.get('role', 'consumer')),
                    oauth_provider='google',
                    oauth_id=google_user['sub'],
                    profile_image=google_user.get('picture'),
                    is_email_verified=True
                )
                db.session.add(user)
                db.session.flush()
                
                # Create consumer profile by default
                consumer_profile = ConsumerProfile(user_id=user.id)
                db.session.add(consumer_profile)
            
            db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Google login successful',
            'data': {
                'user': user.to_dict(),
                'accessToken': access_token,
                'refreshToken': refresh_token
            },
            'errors': None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Google login failed: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'errors': None
            }), 404
        
        user_data = user.to_dict()
        
        # Add profile data
        if user.role == UserRole.FARMER and user.farmer_profile:
            user_data['farmerProfile'] = user.farmer_profile.to_dict()
        elif user.role == UserRole.CONSUMER and user.consumer_profile:
            user_data['consumerProfile'] = {
                'preferredPaymentMethod': user.consumer_profile.preferred_payment_method
            }
        
        return jsonify({
            'success': True,
            'message': 'User retrieved successfully',
            'data': user_data,
            'errors': None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get user: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is required',
                'errors': None
            }), 400
        
        # Verify token
        payload = verify_token(token)
        if not payload or payload.get('type') != 'email_verification':
            return jsonify({
                'success': False,
                'message': 'Invalid or expired token',
                'errors': None
            }), 400
        
        # Update user
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'errors': None
            }), 404
        
        user.is_email_verified = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Email verified successfully',
            'data': None,
            'errors': None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Email verification failed: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required',
                'errors': None
            }), 400
        
        user = User.query.filter_by(email=email).first()
        
        # Always return success to prevent email enumeration
        if user:
            from app.utils.security import generate_reset_token
            reset_token = generate_reset_token(user.id, expires_in=3600)
            reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
            send_password_reset_email(user.email, user.full_name, reset_link)
        
        return jsonify({
            'success': True,
            'message': 'If the email exists, a password reset link has been sent',
            'data': None,
            'errors': None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Password reset request failed: {str(e)}',
            'errors': None
        }), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({
                'success': False,
                'message': 'Token and password are required',
                'errors': None
            }), 400
        
        # Verify token
        payload = verify_token(token)
        if not payload or payload.get('type') != 'password_reset':
            return jsonify({
                'success': False,
                'message': 'Invalid or expired token',
                'errors': None
            }), 400
        
        # Update password
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'errors': None
            }), 404
        
        user.password_hash = hash_password(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password reset successful',
            'data': None,
            'errors': None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Password reset failed: {str(e)}',
            'errors': None
        }), 500

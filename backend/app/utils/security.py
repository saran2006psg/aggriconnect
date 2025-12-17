import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import current_app
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_verification_token(user_id: str, expires_in: int = 3600) -> str:
    """Generate email verification token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow(),
        'type': 'email_verification'
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token: str) -> dict:
    """Verify and decode a token"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_reset_token(user_id: str, expires_in: int = 3600) -> str:
    """Generate password reset token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow(),
        'type': 'password_reset'
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def role_required(*roles):
    """Decorator to require specific roles"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            from app.models.user import User
            
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'errors': None
                }), 404
            
            if user.role.value not in roles:
                return jsonify({
                    'success': False,
                    'message': 'Insufficient permissions',
                    'errors': None
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

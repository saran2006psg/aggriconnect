from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum


class UserRole(enum.Enum):
    CONSUMER = "consumer"
    FARMER = "farmer"
    ADMIN = "admin"


class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CONSUMER)
    profile_image = Column(String(500), nullable=True)
    phone_number = Column(String(20), nullable=True)
    is_email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # OAuth fields
    oauth_provider = Column(String(50), nullable=True)  # google, apple
    oauth_id = Column(String(255), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    products = db.relationship('Product', back_populates='farmer', lazy='dynamic', cascade='all, delete-orphan')
    consumer_orders = db.relationship('Order', foreign_keys='Order.consumer_id', back_populates='consumer', lazy='dynamic')
    farmer_orders = db.relationship('Order', foreign_keys='Order.farmer_id', back_populates='farmer', lazy='dynamic')
    addresses = db.relationship('Address', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', back_populates='consumer', lazy='dynamic', cascade='all, delete-orphan')
    bulk_orders = db.relationship('BulkOrder', back_populates='consumer', lazy='dynamic', cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    payouts = db.relationship('Payout', back_populates='farmer', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='consumer', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'fullName': self.full_name,
            'role': self.role.value,
            'profileImage': self.profile_image,
            'phoneNumber': self.phone_number,
            'isEmailVerified': self.is_email_verified,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_sensitive:
            data['oauthProvider'] = self.oauth_provider
            
        return data


class ConsumerProfile(db.Model):
    __tablename__ = 'consumer_profiles'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    preferred_payment_method = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('consumer_profile', uselist=False))


class FarmerProfile(db.Model):
    __tablename__ = 'farmer_profiles'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    farm_name = Column(String(255), nullable=False)
    farm_location = Column(String(500), nullable=True)
    farm_description = Column(String(1000), nullable=True)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Bank details (encrypted in production)
    bank_account_number = Column(String(255), nullable=True)
    bank_routing_number = Column(String(50), nullable=True)
    bank_account_holder = Column(String(255), nullable=True)
    stripe_account_id = Column(String(255), nullable=True)  # For Stripe Connect
    
    # Wallet balance
    wallet_balance = Column(Float, default=0.0)
    pending_balance = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = db.relationship('User', backref=db.backref('farmer_profile', uselist=False))
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'farmName': self.farm_name,
            'farmLocation': self.farm_location,
            'farmDescription': self.farm_description,
            'rating': self.rating,
            'totalReviews': self.total_reviews,
            'walletBalance': self.wallet_balance,
            'pendingBalance': self.pending_balance,
        }

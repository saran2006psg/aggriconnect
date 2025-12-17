from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Enum, JSON
import uuid
import enum


class SubscriptionFrequency(enum.Enum):
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"


class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consumer_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    frequency = Column(Enum(SubscriptionFrequency), nullable=False)
    total_price = Column(Float, nullable=False, default=0.0)
    next_delivery_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_paused = Column(Boolean, default=False)
    delivery_address = Column(JSON, nullable=True)
    
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    consumer = db.relationship('User', back_populates='subscriptions')
    items = db.relationship('SubscriptionItem', back_populates='subscription', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Subscription {self.id} - {self.frequency.value}>'
    
    def to_dict(self, include_items=True):
        """Convert subscription to dictionary"""
        data = {
            'id': self.id,
            'consumerId': self.consumer_id,
            'frequency': self.frequency.value,
            'totalPrice': self.total_price,
            'nextDeliveryDate': self.next_delivery_date.isoformat() if self.next_delivery_date else None,
            'isActive': self.is_active,
            'isPaused': self.is_paused,
            'deliveryAddress': self.delivery_address,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
            
        return data


class SubscriptionItem(db.Model):
    __tablename__ = 'subscription_items'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = Column(String, ForeignKey('subscriptions.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = Column(String, ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    subscription = db.relationship('Subscription', back_populates='items')
    product = db.relationship('Product')
    
    def __repr__(self):
        return f'<SubscriptionItem {self.product_name} x {self.quantity}>'
    
    def to_dict(self):
        """Convert subscription item to dictionary"""
        return {
            'id': self.id,
            'subscriptionId': self.subscription_id,
            'productId': self.product_id,
            'productName': self.product_name,
            'quantity': self.quantity,
            'price': self.price,
        }

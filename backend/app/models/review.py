from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
import uuid


class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey('products.id', ondelete='CASCADE'), nullable=False, index=True)
    consumer_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    order_id = Column(String, ForeignKey('orders.id', ondelete='SET NULL'), nullable=True)
    
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    product = db.relationship('Product', back_populates='reviews')
    consumer = db.relationship('User', back_populates='reviews')
    
    def __repr__(self):
        return f'<Review product={self.product_id} rating={self.rating}>'
    
    def to_dict(self, include_consumer=True):
        """Convert review to dictionary"""
        data = {
            'id': self.id,
            'productId': self.product_id,
            'consumerId': self.consumer_id,
            'orderId': self.order_id,
            'rating': self.rating,
            'comment': self.comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_consumer and self.consumer:
            data['consumer'] = {
                'name': self.consumer.full_name,
                'profileImage': self.consumer.profile_image
            }
            
        return data

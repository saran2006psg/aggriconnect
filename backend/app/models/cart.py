from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
import uuid


class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = Column(String, ForeignKey('products.id', ondelete='CASCADE'), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='cart_items')
    product = db.relationship('Product', back_populates='cart_items')
    
    def __repr__(self):
        return f'<CartItem user={self.user_id} product={self.product_id}>'
    
    def to_dict(self):
        """Convert cart item to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'addedAt': self.added_at.isoformat() if self.added_at else None,
            'product': self.product.to_dict() if self.product else None,
        }

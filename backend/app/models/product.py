from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
import uuid


class Product(db.Model):
    __tablename__ = 'products'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False, default='lb')
    image = Column(String(500), nullable=True)
    farmer_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    location = Column(String(500), nullable=True)
    harvest_date = Column(DateTime, nullable=True)
    stock = Column(Integer, default=0, nullable=False)
    is_available = Column(Boolean, default=True)
    is_organic = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    farmer = db.relationship('User', back_populates='products')
    cart_items = db.relationship('CartItem', back_populates='product', lazy='dynamic', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', back_populates='product', lazy='dynamic')
    reviews = db.relationship('Review', back_populates='product', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Product {self.name}>'
    
    def to_dict(self, include_farmer=True):
        """Convert product to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'unit': self.unit,
            'image': self.image,
            'farmerId': self.farmer_id,
            'category': self.category,
            'description': self.description,
            'location': self.location,
            'harvestDate': self.harvest_date.isoformat() if self.harvest_date else None,
            'stock': self.stock,
            'isAvailable': self.is_available,
            'isOrganic': self.is_organic,
            'rating': self.rating,
            'totalReviews': self.total_reviews,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_farmer and self.farmer:
            if hasattr(self.farmer, 'farmer_profile') and self.farmer.farmer_profile:
                data['farmer'] = self.farmer.farmer_profile.farm_name
            else:
                data['farmer'] = self.farmer.full_name
                
        return data

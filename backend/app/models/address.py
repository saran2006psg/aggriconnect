from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
import uuid


class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)
    country = Column(String(100), default='USA', nullable=False)
    
    label = Column(String(50), nullable=True)  # 'Home', 'Work', etc.
    is_default = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='addresses')
    
    def __repr__(self):
        return f'<Address {self.street}, {self.city}>'
    
    def to_dict(self):
        """Convert address to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'zipCode': self.zip_code,
            'country': self.country,
            'label': self.label,
            'isDefault': self.is_default,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Enum, JSON
import uuid
import enum


class BulkOrderStatus(enum.Enum):
    PENDING = "Pending"
    MATCHED = "Matched"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    COMPLETED = "Completed"


class BulkOrderFrequency(enum.Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    ONE_TIME = "One-time"


class BulkOrder(db.Model):
    __tablename__ = 'bulk_orders'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consumer_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    assigned_farmer_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    
    business_name = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=False)
    business_location = Column(String(500), nullable=False)
    
    budget_min = Column(Float, nullable=False)
    budget_max = Column(Float, nullable=False)
    
    status = Column(Enum(BulkOrderStatus), default=BulkOrderStatus.PENDING, nullable=False)
    
    # Additional details
    notes = Column(String(1000), nullable=True)
    farmer_response = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    consumer = db.relationship('User', foreign_keys=[consumer_id], back_populates='bulk_orders')
    assigned_farmer = db.relationship('User', foreign_keys=[assigned_farmer_id])
    requirements = db.relationship('BulkOrderItem', back_populates='bulk_order', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<BulkOrder {self.id} - {self.business_name}>'
    
    def to_dict(self, include_requirements=True):
        """Convert bulk order to dictionary"""
        data = {
            'id': self.id,
            'consumerId': self.consumer_id,
            'assignedFarmerId': self.assigned_farmer_id,
            'businessName': self.business_name,
            'businessType': self.business_type,
            'businessLocation': self.business_location,
            'budgetMin': self.budget_min,
            'budgetMax': self.budget_max,
            'status': self.status.value,
            'notes': self.notes,
            'farmerResponse': self.farmer_response,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_requirements:
            data['requirements'] = [item.to_dict() for item in self.requirements]
            
        return data


class BulkOrderItem(db.Model):
    __tablename__ = 'bulk_order_items'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bulk_order_id = Column(String, ForeignKey('bulk_orders.id', ondelete='CASCADE'), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    frequency = Column(Enum(BulkOrderFrequency), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    bulk_order = db.relationship('BulkOrder', back_populates='requirements')
    
    def __repr__(self):
        return f'<BulkOrderItem {self.product_name} x {self.quantity}>'
    
    def to_dict(self):
        """Convert bulk order item to dictionary"""
        return {
            'id': self.id,
            'bulkOrderId': self.bulk_order_id,
            'productName': self.product_name,
            'quantity': self.quantity,
            'unit': self.unit,
            'frequency': self.frequency.value,
        }

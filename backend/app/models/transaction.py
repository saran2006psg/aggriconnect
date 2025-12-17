from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
import uuid
import enum


class TransactionType(enum.Enum):
    CREDIT = "credit"
    DEBIT = "debit"


class TransactionStatus(enum.Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    FAILED = "Failed"


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(500), nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED, nullable=False)
    
    related_order_id = Column(String, ForeignKey('orders.id', ondelete='SET NULL'), nullable=True)
    related_payout_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = db.relationship('User', back_populates='transactions')
    
    def __repr__(self):
        return f'<Transaction {self.id} - {self.type.value} ${self.amount}>'
    
    def to_dict(self):
        """Convert transaction to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type.value,
            'amount': self.amount,
            'description': self.description,
            'status': self.status.value,
            'relatedOrderId': self.related_order_id,
            'relatedPayoutId': self.related_payout_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class PayoutStatus(enum.Enum):
    PENDING = "Pending"
    PROCESSING = "Processing"
    COMPLETED = "Completed"
    FAILED = "Failed"


class Payout(db.Model):
    __tablename__ = 'payouts'
    
    id = Column(String, primary_key=True, default=lambda: f"PO-{uuid.uuid4().hex[:8].upper()}")
    farmer_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    destination = Column(String(255), nullable=False)  # Masked account info
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING, nullable=False)
    
    stripe_transfer_id = Column(String(255), nullable=True)
    failure_reason = Column(String(500), nullable=True)
    
    initiated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    farmer = db.relationship('User', back_populates='payouts')
    
    def __repr__(self):
        return f'<Payout {self.id} - ${self.amount}>'
    
    def to_dict(self):
        """Convert payout to dictionary"""
        return {
            'id': self.id,
            'farmerId': self.farmer_id,
            'amount': self.amount,
            'destination': self.destination,
            'status': self.status.value,
            'failureReason': self.failure_reason,
            'initiatedAt': self.initiated_at.isoformat() if self.initiated_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
        }

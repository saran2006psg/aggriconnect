from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum
import uuid
import enum


class NotificationType(enum.Enum):
    ORDER = "order"
    PAYMENT = "payment"
    SYSTEM = "system"
    PROMOTION = "promotion"


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    
    related_entity_id = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = db.relationship('User', back_populates='notifications')
    
    def __repr__(self):
        return f'<Notification {self.title}>'
    
    def to_dict(self):
        """Convert notification to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type.value,
            'isRead': self.is_read,
            'relatedEntityId': self.related_entity_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

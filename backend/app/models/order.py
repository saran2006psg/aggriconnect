from datetime import datetime
from app.database import db
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Enum, JSON, Boolean
import uuid
import enum


class OrderStatus(enum.Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    OUT_FOR_DELIVERY = "Out for Delivery"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class DeliveryType(enum.Enum):
    DELIVERY = "Delivery"
    PICKUP = "Pickup"


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = Column(String, primary_key=True, default=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
    consumer_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    farmer_id = Column(String, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    
    subtotal = Column(Float, nullable=False, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False, default=0.0)
    
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    delivery_type = Column(Enum(DeliveryType), default=DeliveryType.DELIVERY, nullable=False)
    
    delivery_address = Column(JSON, nullable=True)
    promo_code = Column(String(50), nullable=True)
    
    estimated_delivery_time = Column(DateTime, nullable=True)
    actual_delivery_time = Column(DateTime, nullable=True)
    
    tracking_info = Column(JSON, nullable=True)
    qr_code = Column(String(500), nullable=True)
    timeline = Column(JSON, nullable=True, default=[])
    
    # Payment
    payment_intent_id = Column(String(255), nullable=True)
    payment_status = Column(String(50), default='pending')
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    consumer = db.relationship('User', foreign_keys=[consumer_id], back_populates='consumer_orders')
    farmer = db.relationship('User', foreign_keys=[farmer_id], back_populates='farmer_orders')
    items = db.relationship('OrderItem', back_populates='order', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Order {self.id}>'
    
    def to_dict(self, include_items=True):
        """Convert order to dictionary"""
        data = {
            'id': self.id,
            'consumerId': self.consumer_id,
            'farmerId': self.farmer_id,
            'subtotal': self.subtotal,
            'deliveryFee': self.delivery_fee,
            'discount': self.discount,
            'total': self.total,
            'status': self.status.value,
            'deliveryType': self.delivery_type.value,
            'deliveryAddress': self.delivery_address,
            'promoCode': self.promo_code,
            'estimatedDeliveryTime': self.estimated_delivery_time.isoformat() if self.estimated_delivery_time else None,
            'actualDeliveryTime': self.actual_delivery_time.isoformat() if self.actual_delivery_time else None,
            'trackingInfo': self.tracking_info,
            'qrCode': self.qr_code,
            'timeline': self.timeline or [],
            'paymentStatus': self.payment_status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
            
        return data


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = Column(String, ForeignKey('products.id', ondelete='SET NULL'), nullable=True)
    
    product_name = Column(String(255), nullable=False)
    product_image = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    order = db.relationship('Order', back_populates='items')
    product = db.relationship('Product', back_populates='order_items')
    
    def __repr__(self):
        return f'<OrderItem {self.product_name} x {self.quantity}>'
    
    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            'id': self.id,
            'orderId': self.order_id,
            'productId': self.product_id,
            'productName': self.product_name,
            'productImage': self.product_image,
            'price': self.price,
            'unit': self.unit,
            'quantity': self.quantity,
            'subtotal': self.subtotal,
        }

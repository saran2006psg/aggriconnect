from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
from decimal import Decimal

# Order Schemas
class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    farmer_id: str
    farmer_name: str
    quantity: int
    price_at_purchase: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

class CreateOrderRequest(BaseModel):
    delivery_type: Literal["Delivery", "Pickup"]
    delivery_address_id: Optional[str] = None
    promo_code: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    status: Literal["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"]

class OrderResponse(BaseModel):
    id: str
    order_number: str
    consumer_id: str
    consumer_name: str
    delivery_type: Literal["Delivery", "Pickup"]
    delivery_address: Optional[dict] = None
    status: Literal["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"]
    items: List[OrderItemResponse]
    subtotal: Decimal
    delivery_fee: Decimal
    promo_code: Optional[str]
    discount: Decimal
    total: Decimal
    qr_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class SubscriptionCreate(BaseModel):
    frequency: Literal["Weekly", "Monthly"]
    items: List[SubscriptionItemCreate]

class SubscriptionItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    frequency: Literal["Weekly", "Monthly"]
    status: Literal["Active", "Paused", "Cancelled"]
    items: List[SubscriptionItemResponse]
    total_amount: Decimal
    next_delivery_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Bulk Order Schemas
class BulkOrderItemCreate(BaseModel):
    product_name: str
    quantity: Decimal = Field(..., gt=0)
    unit: str
    frequency: Literal["Daily", "Weekly", "One-time"]

class BulkOrderCreate(BaseModel):
    business_name: str
    business_type: Literal["Restaurant", "Hotel", "Caterer"]
    business_location: str
    budget_min: Decimal = Field(..., gt=0)
    budget_max: Decimal = Field(..., gt=0)
    items: List[BulkOrderItemCreate]

class BulkOrderItemResponse(BaseModel):
    id: str
    product_name: str
    quantity: Decimal
    unit: str
    frequency: Literal["Daily", "Weekly", "One-time"]

    class Config:
        from_attributes = True

class BulkOrderResponseCreate(BaseModel):
    message: str
    quoted_price: Decimal = Field(..., gt=0)

class BulkOrderResponseItem(BaseModel):
    id: str
    farmer_id: str
    farmer_name: str
    message: str
    quoted_price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True

class BulkOrderResponse(BaseModel):
    id: str
    consumer_id: str
    consumer_name: str
    business_name: str
    business_type: Literal["Restaurant", "Hotel", "Caterer"]
    business_location: str
    budget_min: Decimal
    budget_max: Decimal
    status: Literal["Pending", "Responded", "Accepted", "Rejected"]
    items: List[BulkOrderItemResponse]
    responses: List[BulkOrderResponseItem]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

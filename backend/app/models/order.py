from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID


OrderStatus = Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]


class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: UUID
    order_id: UUID
    subtotal: float
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    shipping_address: str = Field(..., min_length=10)


class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    delivery_date: Optional[datetime] = None


class OrderResponse(OrderBase):
    id: UUID
    order_number: str
    user_id: UUID
    farmer_id: UUID
    status: OrderStatus
    total_amount: float
    order_date: datetime
    delivery_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    farmer_name: Optional[str] = None
    user_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    limit: int
    offset: int

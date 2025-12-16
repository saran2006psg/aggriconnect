from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CartItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)


class CartItemResponse(BaseModel):
    id: UUID
    cart_id: UUID
    product_id: UUID
    quantity: int
    price_at_time: float
    added_at: datetime
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    current_price: Optional[float] = None
    farmer_id: Optional[UUID] = None
    
    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: List[CartItemResponse] = []
    total_items: int = 0
    total_price: float = 0.0
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

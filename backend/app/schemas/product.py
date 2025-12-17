from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime, date
from decimal import Decimal

# Product Schemas
class ProductBase(BaseModel):
    name: str
    price: Decimal = Field(..., gt=0)
    unit: str
    category: Literal["Fruits", "Vegetables", "Dairy", "Honey", "Herbs"]
    description: Optional[str] = None
    location: Optional[str] = None
    stock_quantity: int = Field(default=0, ge=0)
    is_available: bool = True
    harvest_date: Optional[date] = None

class ProductCreate(ProductBase):
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = None
    category: Optional[Literal["Fruits", "Vegetables", "Dairy", "Honey", "Herbs"]] = None
    description: Optional[str] = None
    location: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None
    harvest_date: Optional[date] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    farmer_id: str
    farmer: Optional[str] = None  # Farmer name
    image_url: Optional[str] = None
    rating: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    price: Decimal
    unit: str
    image_url: Optional[str]
    farmer: str
    quantity: int
    subtotal: Decimal

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    user_id: str
    items: list[CartItemResponse]
    total: Decimal
    item_count: int

    class Config:
        from_attributes = True

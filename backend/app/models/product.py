from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., max_length=100)
    price: float = Field(..., gt=0)
    unit: str = Field(..., max_length=50)
    location: Optional[str] = Field(None, max_length=255)
    stock_quantity: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: UUID
    farmer_id: UUID
    image_url: Optional[str] = None
    rating: float
    rating_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    farmer_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class ProductSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    farmer_id: Optional[UUID] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

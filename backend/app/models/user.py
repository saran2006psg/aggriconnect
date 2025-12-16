from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


# Enums
Role = Literal["consumer", "farmer", "admin"]


# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: Role


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    profile_image_url: Optional[str] = None


class UserInDB(UserBase):
    id: UUID
    password_hash: str
    profile_image_url: Optional[str] = None
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserResponse(UserBase):
    id: UUID
    profile_image_url: Optional[str] = None
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Farmer Profile Schemas
class FarmerProfileBase(BaseModel):
    farm_name: str = Field(..., min_length=1, max_length=255)
    farm_location: Optional[str] = Field(None, max_length=255)
    farm_description: Optional[str] = None


class FarmerProfileCreate(FarmerProfileBase):
    pass


class FarmerProfileUpdate(BaseModel):
    farm_name: Optional[str] = Field(None, min_length=1, max_length=255)
    farm_location: Optional[str] = Field(None, max_length=255)
    farm_description: Optional[str] = None


class FarmerProfileResponse(FarmerProfileBase):
    id: UUID
    user_id: UUID
    total_rating: float
    rating_count: int
    wallet_balance: float
    products_count: int
    total_sales: float
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

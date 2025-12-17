from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Literal["consumer", "farmer", "admin"]
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None

class UserResponse(UserBase):
    id: str
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Login/Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str
    role: Optional[Literal["consumer", "farmer"]] = "consumer"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class AuthResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    errors: Optional[dict] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

# Address Schemas
class AddressBase(BaseModel):
    street_address: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

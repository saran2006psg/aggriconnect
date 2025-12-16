from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID


# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


# Token Payload
class TokenPayload(BaseModel):
    sub: UUID  # user_id
    email: str
    role: str
    exp: int
    iat: int

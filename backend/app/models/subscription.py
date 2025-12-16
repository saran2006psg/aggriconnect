from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
from datetime import datetime
from uuid import UUID


SubscriptionFrequency = Literal["weekly", "biweekly", "monthly"]
SubscriptionStatus = Literal["active", "paused", "cancelled"]


class SubscriptionBase(BaseModel):
    product_id: UUID
    frequency: SubscriptionFrequency
    quantity: int = Field(..., gt=0)


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    frequency: SubscriptionFrequency | None = None
    quantity: int | None = Field(None, gt=0)
    status: SubscriptionStatus | None = None


class SubscriptionResponse(SubscriptionBase):
    id: UUID
    user_id: UUID
    status: SubscriptionStatus
    next_delivery_date: datetime
    created_at: datetime
    updated_at: datetime
    product_name: str | None = None
    product_image: str | None = None
    product_price: float | None = None
    
    model_config = ConfigDict(from_attributes=True)

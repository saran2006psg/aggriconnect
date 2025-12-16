from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID


TransactionType = Literal["credit", "debit"]
TransactionStatus = Literal["pending", "completed", "failed"]


class WalletResponse(BaseModel):
    id: UUID
    user_id: UUID
    balance: float
    total_earned: float
    total_withdrawn: float
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WalletTransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1, max_length=255)


class WalletTransactionCreate(WalletTransactionBase):
    type: TransactionType
    order_id: Optional[UUID] = None


class WalletTransactionResponse(WalletTransactionBase):
    id: UUID
    wallet_id: UUID
    type: TransactionType
    order_id: Optional[UUID] = None
    status: TransactionStatus
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0)
    bank_account: Optional[str] = None
    notes: Optional[str] = None

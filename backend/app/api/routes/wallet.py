from fastapi import APIRouter, HTTPException, status, Depends, Query
from supabase import Client
from app.database import get_db
from app.models import WalletResponse, WalletTransactionResponse, WithdrawalRequest
from app.dependencies import get_current_farmer
from app.models.schemas import TokenPayload
from typing import List
from datetime import datetime


router = APIRouter()


@router.get("/", response_model=WalletResponse)
async def get_wallet(
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Get farmer's wallet"""
    result = db.table("wallets").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not result.data:
        # Create wallet if doesn't exist
        new_wallet = {
            "user_id": str(current_user.sub),
            "balance": 0.0,
            "total_earned": 0.0,
            "total_withdrawn": 0.0,
            "updated_at": datetime.utcnow().isoformat()
        }
        result = db.table("wallets").insert(new_wallet).execute()
    
    return result.data[0]


@router.get("/transactions", response_model=List[WalletTransactionResponse])
async def get_transactions(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Get wallet transaction history"""
    # Get wallet
    wallet_result = db.table("wallets").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not wallet_result.data:
        return []
    
    wallet = wallet_result.data[0]
    
    # Get transactions
    result = db.table("wallet_transactions").select("*").eq(
        "wallet_id", wallet["id"]
    ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return result.data


@router.post("/withdraw", response_model=dict, status_code=status.HTTP_201_CREATED)
async def request_withdrawal(
    withdrawal_data: WithdrawalRequest,
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Request withdrawal from wallet"""
    # Get wallet
    wallet_result = db.table("wallets").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not wallet_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    wallet = wallet_result.data[0]
    
    # Check balance
    if wallet["balance"] < withdrawal_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: ${wallet['balance']:.2f}"
        )
    
    # Minimum withdrawal amount
    if withdrawal_data.amount < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum withdrawal amount is $10"
        )
    
    # Create withdrawal transaction
    transaction = {
        "wallet_id": wallet["id"],
        "type": "debit",
        "amount": withdrawal_data.amount,
        "description": f"Withdrawal request - {withdrawal_data.notes or 'No notes'}",
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = db.table("wallet_transactions").insert(transaction).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create withdrawal request"
        )
    
    # Update wallet balance (deduct the amount)
    new_balance = wallet["balance"] - withdrawal_data.amount
    new_total_withdrawn = wallet["total_withdrawn"] + withdrawal_data.amount
    
    db.table("wallets").update({
        "balance": new_balance,
        "total_withdrawn": new_total_withdrawn,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", wallet["id"]).execute()
    
    return {
        "message": "Withdrawal request submitted successfully",
        "transaction_id": result.data[0]["id"],
        "amount": withdrawal_data.amount,
        "status": "pending",
        "note": "Your withdrawal will be processed within 3-5 business days"
    }


@router.get("/earnings", response_model=dict)
async def get_earnings(
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Get earnings summary and statistics"""
    # Get wallet
    wallet_result = db.table("wallets").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not wallet_result.data:
        return {
            "current_balance": 0.0,
            "total_earned": 0.0,
            "total_withdrawn": 0.0,
            "pending_withdrawals": 0.0,
            "recent_earnings": []
        }
    
    wallet = wallet_result.data[0]
    
    # Get pending withdrawals
    pending_result = db.table("wallet_transactions").select("amount").eq(
        "wallet_id", wallet["id"]
    ).eq("type", "debit").eq("status", "pending").execute()
    
    pending_withdrawals = sum(t["amount"] for t in pending_result.data)
    
    # Get recent earnings (last 10 credit transactions)
    recent_result = db.table("wallet_transactions").select("*").eq(
        "wallet_id", wallet["id"]
    ).eq("type", "credit").order("created_at", desc=True).limit(10).execute()
    
    return {
        "current_balance": wallet["balance"],
        "total_earned": wallet["total_earned"],
        "total_withdrawn": wallet["total_withdrawn"],
        "pending_withdrawals": pending_withdrawals,
        "recent_earnings": recent_result.data
    }

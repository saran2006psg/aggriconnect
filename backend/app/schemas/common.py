from pydantic import BaseModel
from typing import Optional, Any, List, TypeVar, Generic
from datetime import datetime

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errors: Optional[Any] = None

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: dict
    errors: Optional[Any] = None

    class Config:
        from_attributes = True

def create_response(
    success: bool = True,
    message: str = "Success",
    data: Optional[Any] = None,
    errors: Optional[Any] = None
) -> dict:
    """Create standardized API response."""
    return {
        "success": success,
        "message": message,
        "data": data,
        "errors": errors
    }

def create_paginated_response(
    items: List[Any],
    page: int,
    per_page: int,
    total: int,
    message: str = "Success"
) -> dict:
    """Create paginated API response."""
    return {
        "success": True,
        "message": message,
        "data": {
            "items": items,
            "page": page,
            "perPage": per_page,
            "total": total,
            "totalPages": (total + per_page - 1) // per_page
        },
        "errors": None
    }

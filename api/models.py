from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Group Models
class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True

# Expense Models
class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")

class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: Decimal
    group_id: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Response Models
class GroupListResponse(BaseModel):
    groups: List[GroupResponse]
    count: int

class ExpenseListResponse(BaseModel):
    expenses: List[ExpenseResponse]
    count: int
    total_amount: Decimal

# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int 
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from app.core.dependencies import get_db
from app.core.security import create_access_token
from app.db.models import User, Role
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    tenant_id: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login with email and password (P1-1).
    """
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Get role permissions
    stmt = select(Role).where(Role.id == user.role_id)
    result = await db.execute(stmt)
    role = result.scalar_one_or_none()
    permissions = role.permissions if role else []

    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "tenant_id": user.tenant_id,
        "role": role.name if role else "customer",
        "permissions": permissions
    }
    
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": role.name if role else "customer",
        "tenant_id": user.tenant_id
    }

@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db)):
    """Get current user information from JWT token."""
    from app.core.security import get_current_user

    try:
        user_data = await get_current_user()
        # Get full user info from database
        stmt = select(User).where(User.email == user_data.get("sub"))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        stmt = select(Role).where(Role.id == user.role_id)
        result = await db.execute(stmt)
        role = result.scalar_one_or_none()

        return {
            "id": user.id,
            "email": user.email,
            "role": role.name if role else "customer",
            "tenant_id": user.tenant_id,
            "status": "active"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized")

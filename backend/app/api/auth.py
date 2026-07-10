"""认证路由：注册、登录、当前用户信息。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.security import create_access_token, pwd_context
from app.database import get_db
from app.models.user import User
from app.schemas.user import LoginIn, TokenOut, UserOut, UserRegisterIn

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterIn, db: AsyncSession = Depends(get_db)
):
    """注册新用户：校验邮箱唯一性、哈希密码、创建 student 账号并签发令牌。"""
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="该邮箱已被注册"
        )

    user = User(
        email=payload.email,
        password_hash=pwd_context.hash(payload.password),
        role="student",
        status="active",
        score=0,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user)
    return TokenOut(access_token=token, role=user.role)


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    """登录：校验用户存在、状态活跃且密码正确，统一 401 不泄露具体原因。"""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # 邮箱不存在、状态非活跃或密码错误均返回相同的 401
    if user is None or user.status != "active" or not pwd_context.verify(
        payload.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user)
    return TokenOut(access_token=token, role=user.role)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    """返回当前登录用户信息。"""
    return current_user

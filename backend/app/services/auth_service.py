from datetime import datetime, timezone
from typing import Tuple
from fastapi import HTTPException, status
from app.models.user import User, Organization
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.security import get_password_hash, verify_password, create_access_token, create_refresh_token

class AuthService:
    @staticmethod
    async def register(req: RegisterRequest) -> Tuple[User, Organization, str, str]:
        # Check existing user
        existing_user = await User.find_one({"email": req.email})
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

        slug = req.organization_name.lower().replace(" ", "-")
        org = await Organization.find_one({"slug": slug})
        if not org:
            org = Organization(
                name=req.organization_name,
                slug=slug
            )
            await org.insert()

        hashed_pw = get_password_hash(req.password)
        user = User(
            organization_id=str(org.id),
            full_name=req.full_name,
            email=req.email,
            password_hash=hashed_pw,
            role=req.role
        )
        await user.insert()

        access_token = create_access_token(user.id, org.id, user.role)
        refresh_token = create_refresh_token(user.id)
        
        return user, org, access_token, refresh_token

    @staticmethod
    async def login(req: LoginRequest) -> Tuple[User, Organization, str, str]:
        user = await User.find_one({"email": req.email})
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")

        user.last_login = datetime.now(timezone.utc)
        await user.save()

        org = await Organization.get(user.organization_id)
        if not org:
            org = Organization(name="Default Org", slug="default-org")
            await org.insert()
            user.organization_id = str(org.id)
            await user.save()

        access_token = create_access_token(user.id, org.id, user.role)
        refresh_token = create_refresh_token(user.id)

        return user, org, access_token, refresh_token

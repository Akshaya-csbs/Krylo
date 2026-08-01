from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field, EmailStr

class Organization(Document):
    name: str
    slug: Indexed(str, unique=True)
    industry: Optional[str] = None
    website: Optional[str] = None
    plan: str = "Enterprise"
    logo: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "organizations"

class User(Document):
    organization_id: str
    full_name: str
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    role: str = "brand_manager"  # super_admin, org_admin, brand_manager, designer, viewer
    is_active: bool = True
    is_verified: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"

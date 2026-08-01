from typing import Optional
from pydantic import BaseModel

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class OrganizationUpdateRequest(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None

class SettingsDTO(BaseModel):
    profile: dict
    organization: dict

from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import StandardResponse
from app.schemas.settings import ProfileUpdateRequest, OrganizationUpdateRequest, SettingsDTO
from app.api.deps import get_current_user
from app.models.user import User, Organization
from datetime import datetime, timezone

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=StandardResponse)
async def get_settings(current_user: User = Depends(get_current_user)):
    org = await Organization.get(current_user.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    return StandardResponse(
        success=True,
        data={
            "profile": {
                "fullName": current_user.full_name,
                "email": current_user.email,
                "role": current_user.role
            },
            "organization": {
                "name": org.name,
                "industry": org.industry,
                "website": org.website
            }
        }
    )

@router.put("/profile", response_model=StandardResponse)
async def update_profile(req: ProfileUpdateRequest, current_user: User = Depends(get_current_user)):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.email is not None:
        current_user.email = req.email
    if req.role is not None:
        current_user.role = req.role
    
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    
    return StandardResponse(
        success=True,
        message="Profile updated successfully",
        data={
            "fullName": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    )

@router.put("/organization", response_model=StandardResponse)
async def update_organization(req: OrganizationUpdateRequest, current_user: User = Depends(get_current_user)):
    org = await Organization.get(current_user.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    if req.name:
        org.name = req.name
    if req.industry is not None:
        org.industry = req.industry
    if req.website is not None:
        org.website = req.website
        
    org.updated_at = datetime.now(timezone.utc)
    await org.save()
    
    return StandardResponse(
        success=True,
        message="Organization updated successfully",
        data={
            "name": org.name,
            "industry": org.industry,
            "website": org.website
        }
    )

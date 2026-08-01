from typing import Optional
from fastapi import APIRouter, Depends, Header, Query
from app.schemas.auth import StandardResponse
from app.schemas.identity import BuildIdentityRequest, BrandIdentityDTO
from app.services.identity_service import IdentityService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/identity", tags=["Module 3 - Brand Identity Intelligence Engine"])

@router.post("/build/{brand_id}", response_model=StandardResponse)
async def build_identity(
    brand_id: str,
    force_rebuild: bool = Query(False),
    groq_api_key: Optional[str] = Query(None, description="Optional Groq API Key to analyze historical audio/video/image assets via LLaMA 3.2 Vision"),
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key"),
    current_user: User = Depends(get_current_user)
):
    key = groq_api_key or x_groq_api_key
    identity, job = await IdentityService.build_identity(brand_id, current_user.organization_id, force_rebuild=force_rebuild, groq_api_key=key)
    dto = BrandIdentityDTO(
        id=str(identity.id),
        brand_id=identity.brand_id,
        version=identity.version,
        voice=identity.voice,
        visual=identity.visual,
        emotion=identity.emotion,
        audience=identity.audience,
        keywords=identity.keywords,
        personality=identity.personality,
        design_rules=identity.design_rules,
        brand_summary=identity.brand_summary,
        confidence_score=identity.confidence_score,
        status=identity.status,
        assets_processed_count=identity.assets_processed_count
    )
    return StandardResponse(
        success=True,
        message="Brand Identity Model synthesized successfully via Groq Engine",
        data={"identity": dto, "job_id": str(job.id)}
    )

@router.get("/{brand_id}", response_model=StandardResponse)
async def get_identity(brand_id: str, current_user: User = Depends(get_current_user)):
    identity = await IdentityService.get_identity(brand_id, current_user.organization_id)
    dto = BrandIdentityDTO(
        id=str(identity.id),
        brand_id=identity.brand_id,
        version=identity.version,
        voice=identity.voice,
        visual=identity.visual,
        emotion=identity.emotion,
        audience=identity.audience,
        keywords=identity.keywords,
        personality=identity.personality,
        design_rules=identity.design_rules,
        brand_summary=identity.brand_summary,
        confidence_score=identity.confidence_score,
        services=getattr(identity, 'services', []),
        social_links=getattr(identity, 'social_links', {}),
        metrics=getattr(identity, 'metrics', {}),
        status=identity.status,
        assets_processed_count=identity.assets_processed_count
    )
    return StandardResponse(success=True, data=dto)

@router.post("/rebuild/{brand_id}", response_model=StandardResponse)
async def rebuild_identity(
    brand_id: str,
    groq_api_key: Optional[str] = Query(None),
    x_groq_api_key: Optional[str] = Header(None, alias="X-Groq-Api-Key"),
    current_user: User = Depends(get_current_user)
):
    key = groq_api_key or x_groq_api_key
    identity, job = await IdentityService.build_identity(brand_id, current_user.organization_id, force_rebuild=True, groq_api_key=key)
    dto = BrandIdentityDTO(
        id=str(identity.id),
        brand_id=identity.brand_id,
        version=identity.version,
        voice=identity.voice,
        visual=identity.visual,
        emotion=identity.emotion,
        audience=identity.audience,
        keywords=identity.keywords,
        personality=identity.personality,
        design_rules=identity.design_rules,
        brand_summary=identity.brand_summary,
        confidence_score=identity.confidence_score,
        status=identity.status,
        assets_processed_count=identity.assets_processed_count
    )
    return StandardResponse(
        success=True,
        message="Brand Identity Model rebuilt successfully via Groq Engine",
        data={"identity": dto, "job_id": str(job.id)}
    )

from fastapi import APIRouter, Depends
from app.schemas.auth import StandardResponse
from app.schemas.validation import ValidationCheckRequest, ValidationReportDTO, IssueDTO, LayeredAnalysisRequest, LayeredAnalysisResponseDTO
from app.services.validation_service import ValidationService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/validation", tags=["Module 4 - Brand Validation & Certification Engine"])

@router.post("/check", response_model=StandardResponse)
async def check_validation(req: ValidationCheckRequest, current_user: User = Depends(get_current_user)):
    report = await ValidationService.validate_content(current_user.organization_id, req)
    issues_dtos = [
        IssueDTO(
            category=i["category"],
            severity=i["severity"],
            message=i["message"],
            solution=i.get("solution")
        )
        for i in report.issues
    ]
    dto = ValidationReportDTO(
        id=str(report.id),
        campaign_id=report.campaign_id,
        brand_id=report.brand_id,
        overall_score=report.overall_score,
        status=report.status,
        scores=report.scores,
        issues=issues_dtos,
        recommendations=report.recommendations,
        created_at=report.created_at.isoformat()
    )
    return StandardResponse(
        success=True,
        message=f"Brand validation certification completed with score {report.overall_score}%",
        data=dto
    )

@router.get("/{campaign_id}", response_model=StandardResponse)
async def get_validation_report(campaign_id: str, current_user: User = Depends(get_current_user)):
    report = await ValidationService.get_report_by_campaign(campaign_id)
    issues_dtos = [
        IssueDTO(
            category=i["category"],
            severity=i["severity"],
            message=i["message"],
            solution=i.get("solution")
        )
        for i in report.issues
    ]
    dto = ValidationReportDTO(
        id=str(report.id),
        campaign_id=report.campaign_id,
        brand_id=report.brand_id,
        overall_score=report.overall_score,
        status=report.status,
        scores=report.scores,
        issues=issues_dtos,
        recommendations=report.recommendations,
        created_at=report.created_at.isoformat()
    )
    return StandardResponse(success=True, data=dto)

@router.post("/recheck", response_model=StandardResponse)
async def recheck_validation(req: ValidationCheckRequest, current_user: User = Depends(get_current_user)):
    return await check_validation(req, current_user)

@router.post("/layered-analysis", response_model=StandardResponse)
async def layered_analysis(req: LayeredAnalysisRequest, current_user: User = Depends(get_current_user)):
    result = await ValidationService.run_layered_analysis(current_user.organization_id, req)
    return StandardResponse(
        success=True,
        message="Layered analysis completed successfully.",
        data=result
    )

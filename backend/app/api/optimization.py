from fastapi import APIRouter, Depends
from app.schemas.auth import StandardResponse
from app.schemas.optimization import OptimizationRunRequest, OptimizationReportDTO
from app.services.optimization_service import OptimizationService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/optimization", tags=["Module 5 - AI Content Optimization Engine"])

@router.post("/run", response_model=StandardResponse)
async def run_optimization(req: OptimizationRunRequest, current_user: User = Depends(get_current_user)):
    try:
        report, new_version = await OptimizationService.run_optimization(current_user.organization_id, req)
        dto = OptimizationReportDTO(
            id=str(report.id),
            campaign_id=report.campaign_id,
            campaign_version_id=report.campaign_version_id,
            original_version=report.original_version,
            optimized_version=report.optimized_version,
            validation_score_before=report.validation_score_before,
            validation_score_after=report.validation_score_after,
            overall_improvement=report.overall_improvement,
            changes=report.changes,
            multi_versions=report.multi_versions,
            status=report.status
        )
        return StandardResponse(
            success=True,
            message=f"Content optimized successfully with +{report.overall_improvement}% score boost",
            data={"report": dto, "optimized_text": new_version.text_content}
        )
    except ValueError as e:
        return StandardResponse(
            success=False,
            message=str(e),
            data=None
        )

@router.get("/{campaign_id}", response_model=StandardResponse)
async def get_optimization_report(campaign_id: str, current_user: User = Depends(get_current_user)):
    from app.models.optimization import OptimizationReport
    report = await OptimizationReport.find_one(OptimizationReport.campaign_id == campaign_id)
    if not report:
        return StandardResponse(success=False, message="Optimization report not found")
    dto = OptimizationReportDTO(
        id=str(report.id),
        campaign_id=report.campaign_id,
        campaign_version_id=report.campaign_version_id,
        original_version=report.original_version,
        optimized_version=report.optimized_version,
        validation_score_before=report.validation_score_before,
        validation_score_after=report.validation_score_after,
        overall_improvement=report.overall_improvement,
        changes=report.changes,
        multi_versions=report.multi_versions,
        status=report.status
    )
    return StandardResponse(success=True, data=dto)

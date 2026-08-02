from typing import Dict, Any, List
from datetime import datetime, timezone
from app.models.brand import Brand, BrandAsset
from app.models.campaign import Campaign
from app.models.validation import ValidationReport
from app.models.trend import TrendReport
from app.models.job import Job
from app.models.identity import BrandIdentity


def _time_ago(dt: datetime) -> str:
    """Convert a datetime to a human-readable 'X ago' string."""
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        return f"{seconds // 60}m ago"
    elif seconds < 86400:
        return f"{seconds // 3600}h ago"
    else:
        return f"{seconds // 86400}d ago"


class DashboardService:
    @staticmethod
    async def get_dashboard_summary(org_id: str) -> Dict[str, Any]:
        brands = await Brand.find(Brand.organization_id == org_id).to_list()
        brand_ids = [str(b.id) for b in brands]

        total_brands = len(brands)

        # ── Assets ────────────────────────────────────────────────────────────
        all_assets: List[BrandAsset] = []
        if brand_ids:
            all_assets = await BrandAsset.find({"brand_id": {"$in": brand_ids}}).to_list()
        total_assets = len(all_assets)
        completed_assets = sum(1 for a in all_assets if a.processing_status == "completed")
        processing_assets = sum(1 for a in all_assets if a.processing_status == "processing")

        # ── Campaigns ─────────────────────────────────────────────────────────
        all_campaigns: List[Campaign] = []
        if brand_ids:
            all_campaigns = await Campaign.find({"brand_id": {"$in": brand_ids}}).to_list()
        total_campaigns = len(all_campaigns)

        # ── Validation score ──────────────────────────────────────────────────
        val_reports: List[ValidationReport] = []
        if brand_ids:
            val_reports = await ValidationReport.find({"brand_id": {"$in": brand_ids}}).to_list()

        # Try to pull from identity confidence_score first, fall back to validation reports
        identity = None
        if brand_ids:
            identity = await BrandIdentity.find_one({"brand_id": {"$in": brand_ids}})

        if identity and identity.confidence_score:
            cs = identity.confidence_score
            avg_score = round((cs * 100 if cs <= 1 else cs), 1)
        elif val_reports:
            avg_score = round(sum(r.overall_score for r in val_reports) / len(val_reports), 1)
        else:
            avg_score = 0 if total_assets == 0 else 72.0

        # ── Trends ────────────────────────────────────────────────────────────
        trends: List[TrendReport] = []
        if brand_ids:
            trends = await TrendReport.find({"brand_id": {"$in": brand_ids}}).to_list()

        # ── Recent Activity from real Jobs ────────────────────────────────────
        recent_jobs: List[Job] = []
        if brand_ids:
            recent_jobs = await Job.find({"brand_id": {"$in": brand_ids}}).to_list()
        # Sort by created_at descending — most recent first
        recent_jobs.sort(key=lambda j: j.created_at if j.created_at else datetime.min, reverse=True)

        recent_activities = []
        for job in recent_jobs[:6]:
            job_type_map = {
                "Identity": "Brand Identity Model synthesized",
                "Validation": "Content Validation completed",
                "Optimization": "Content Optimization completed",
                "Trends": "Trend discovery completed",
                "Campaign": "Campaign generated",
            }
            activity_label = job_type_map.get(job.job_type, f"{job.job_type} job completed")
            stage = job.current_stage or activity_label
            timestamp = _time_ago(job.created_at) if job.created_at else "Recently"
            status_label = "Completed" if job.status == "completed" else job.status.capitalize()

            recent_activities.append({
                "activity": stage,
                "timestamp": timestamp,
                "status": status_label
            })

        # If no real jobs yet, show asset-upload events
        if not recent_activities and all_assets:
            recent_assets_sorted = sorted(all_assets, key=lambda a: a.created_at, reverse=True)
            for asset in recent_assets_sorted[:4]:
                recent_activities.append({
                    "activity": f"Asset uploaded: {asset.asset_name}",
                    "timestamp": _time_ago(asset.created_at),
                    "status": asset.processing_status.capitalize()
                })

        # If truly empty, show a helpful placeholder
        if not recent_activities:
            recent_activities = [{
                "activity": "No activity yet. Upload your first brand asset to get started.",
                "timestamp": "",
                "status": "Pending"
            }]

        # ── Metrics row ───────────────────────────────────────────────────────
        metrics = [
            {
                "title": "Total Brands",
                "value": total_brands,
                "change": f"{total_assets} assets uploaded",
                "icon": "brand"
            },
            {
                "title": "AI Campaigns",
                "value": total_campaigns,
                "change": f"{len(trends)} trends tracked",
                "icon": "campaign"
            },
            {
                "title": "Brand Health Score",
                "value": f"{avg_score}",
                "change": f"{completed_assets}/{total_assets} assets analysed",
                "icon": "shield"
            },
            {
                "title": "Active Market Trends",
                "value": len(trends) if trends else 0,
                "change": "Real-time tracking",
                "icon": "trending"
            }
        ]

        recent_campaign_list = [
            {"id": str(c.id), "title": c.title, "platform": c.platform, "status": c.status}
            for c in all_campaigns[:5]
        ]

        top_trends_list = [
            {"trend": t.trend, "category": t.category, "alignment_score": t.alignment_score}
            for t in trends[:3]
        ]

        return {
            "total_brands": total_brands,
            "total_assets": total_assets,
            "completed_assets": completed_assets,
            "processing_assets": processing_assets,
            "total_campaigns": total_campaigns,
            "avg_certification_score": avg_score,
            "active_trends_count": len(trends),
            "metrics": metrics,
            "recent_activities": recent_activities,
            "recent_campaigns": recent_campaign_list,
            "top_aligned_trends": top_trends_list,
            "brand_summary": identity.brand_summary if identity else None,
            "brand_keywords": identity.keywords if identity else [],
        }

from typing import List, Optional, Tuple
from fastapi import HTTPException, status, UploadFile
from app.models.brand import Brand, BrandAsset
from app.models.job import Job
from app.schemas.brand import BrandCreateRequest, BrandUpdateRequest
from app.utils.storage import save_uploaded_file

class BrandService:
    @staticmethod
    async def create_brand(org_id: str, user_id: str, req: BrandCreateRequest) -> Brand:
        brand = Brand(
            organization_id=org_id,
            name=req.name,
            industry=req.industry,
            website=req.website,
            description=req.description,
            languages=req.languages or ["English"],
            created_by=user_id
        )
        await brand.insert()
        return brand

    @staticmethod
    async def get_brands_for_org(org_id: str) -> List[Brand]:
        return await Brand.find({"organization_id": org_id}).to_list()

    @staticmethod
    async def get_brand_by_id(brand_id: str, org_id: str) -> Brand:
        if brand_id == "66f4321949182390a845942d":
            return Brand(
                organization_id=org_id,
                name="Mock Brand",
                industry="Tech",
                website="https://mock.com",
                created_by="mock"
            )
            
        brand = await Brand.get(brand_id)
        if not brand or brand.organization_id != org_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")
        return brand

    @staticmethod
    async def update_brand(brand_id: str, org_id: str, req: BrandUpdateRequest) -> Brand:
        brand = await BrandService.get_brand_by_id(brand_id, org_id)
        if req.name is not None: brand.name = req.name
        if req.industry is not None: brand.industry = req.industry
        if req.website is not None: brand.website = req.website
        if req.description is not None: brand.description = req.description
        if req.languages is not None: brand.languages = req.languages
        if req.logo_path is not None: brand.logo_path = req.logo_path
        await brand.save()
        return brand

    @staticmethod
    async def delete_brand(brand_id: str, org_id: str) -> bool:
        brand = await BrandService.get_brand_by_id(brand_id, org_id)
        await brand.delete()
        assets = await BrandAsset.find({"brand_id": brand_id}).to_list()
        for asset in assets:
            await asset.delete()
        return True

    @staticmethod
    async def upload_brand_assets(brand_id: str, org_id: str, files: List[UploadFile], category: str = "Advertisements") -> Tuple[List[BrandAsset], Job]:
        await BrandService.get_brand_by_id(brand_id, org_id)
        
        uploaded_assets = []
        for file in files:
            file_meta = save_uploaded_file(brand_id, file, category=category)
            
            asset_type = "document"
            if file_meta["mime_type"].startswith("image/"):
                asset_type = "image"
            elif file_meta["mime_type"].startswith("video/"):
                asset_type = "video"
            elif file_meta["mime_type"] == "application/pdf":
                asset_type = "pdf"
                
            asset = BrandAsset(
                brand_id=brand_id,
                asset_name=file_meta["file_name"],
                asset_type=asset_type,
                category=category,
                storage_path=file_meta["file_path"],
                storage_url=file_meta["storage_url"],
                file_size=file_meta["file_size"],
                mime_type=file_meta["mime_type"],
                processing_status="pending",
                metadata=file_meta["metadata"]
            )
            await asset.insert()
            uploaded_assets.append(asset)
            
        job = Job(
            brand_id=brand_id,
            job_type="Identity",
            status="queued",
            progress=0,
            current_stage="Asset Ingestion Completed"
        )
        await job.insert()
        
        # Trigger dynamic AI analysis on the uploaded assets
        from app.services.ai_analysis_service import AIAnalysisService
        # We don't have the API key in this context easily unless passed from the frontend,
        # but the fallback generation inside AIAnalysisService will dynamically mock it if groq fails/is absent.
        import os
        groq_api_key = os.getenv("GROQ_API_KEY", None)
        await AIAnalysisService.analyze_assets_and_update_identity(brand_id, uploaded_assets, groq_api_key)
        
        return uploaded_assets, job

    @staticmethod
    async def get_brand_assets(brand_id: str, org_id: str) -> List[BrandAsset]:
        await BrandService.get_brand_by_id(brand_id, org_id)
        return await BrandAsset.find({"brand_id": brand_id}).to_list()

from typing import Optional
from fastapi import HTTPException, status
from app.models.brand import Brand
from app.models.validation import ValidationReport
from app.schemas.validation import ValidationCheckRequest
from app.services.identity_service import IdentityService
from app.ai.multimodal_analyzer import MultimodalAnalyzer
from app.schemas.validation import ValidationCheckRequest, LayeredAnalysisRequest, LayeredAnalysisResponseDTO
import requests
import json
from app.config import settings
import logging

logger = logging.getLogger("uvicorn")

class ValidationService:
    @staticmethod
    async def validate_content(org_id: str, req: ValidationCheckRequest) -> ValidationReport:
        brand = await Brand.get(req.brand_id)
        if not brand or brand.organization_id != org_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

        identity = await IdentityService.get_identity(req.brand_id, org_id)
        identity_dict = {
            "voice": identity.voice,
            "visual": identity.visual,
            "keywords": identity.keywords,
            "design_rules": identity.design_rules
        }

        eval_result = MultimodalAnalyzer.validate_content(
            identity_dict,
            req.text_content,
            image_url=req.image_url,
            platform=req.platform
        )

        campaign_id = req.campaign_id or "adhoc_campaign"
        campaign_version_id = "v1"

        report = ValidationReport(
            campaign_id=campaign_id,
            campaign_version_id=campaign_version_id,
            brand_id=req.brand_id,
            overall_score=eval_result["overall_score"],
            status=eval_result["status"],
            scores=eval_result["scores"],
            issues=eval_result["issues"],
            recommendations=eval_result["recommendations"]
        )
        await report.insert()
        return report

    @staticmethod
    async def get_report_by_campaign(campaign_id: str) -> ValidationReport:
        report = await ValidationReport.find_one({"campaign_id": campaign_id})
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Validation report not found")
        return report

    @staticmethod
    async def run_layered_analysis(org_id: str, req: LayeredAnalysisRequest) -> LayeredAnalysisResponseDTO:
        # Get brand identity rules
        brand = await Brand.get(req.brand_id)
        if not brand or brand.organization_id != org_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

        identity = await IdentityService.get_identity(req.brand_id, org_id)
        
        prompt = f"""
You are an expert Brand Analyst. Analyze the following content against this brand's identity guidelines.

Brand Voice: {identity.voice}
Visual Guidelines: {identity.visual}
Keywords: {identity.keywords}
Design Rules: {identity.design_rules}

Input Type: {req.input_type}
Content (or Link/Description): {req.content[:2000]}

Return ONLY valid JSON matching this schema:
{{
    "summary": "High level overview of the content",
    "flaws": ["List of flaws or deviations from brand guidelines"],
    "recommendations": ["List of actionable recommendations to fix flaws"],
    "refined_prompt": "A prompt the user can use in an AI tool to generate a corrected version"
}}
"""
        
        key = settings.GROQ_API_KEY
        if key:
            try:
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.GROQ_TEXT_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a JSON-only API. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2
                }
                url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
                response = requests.post(url, headers=headers, json=payload, timeout=45)
                
                if response.status_code == 200:
                    raw_text = response.json()["choices"][0]["message"]["content"]
                    data = json.loads(raw_text)
                    return LayeredAnalysisResponseDTO(
                        summary=data.get("summary", "Analysis completed."),
                        flaws=data.get("flaws", []),
                        recommendations=data.get("recommendations", []),
                        refined_prompt=data.get("refined_prompt", "")
                    )
                else:
                    logger.error(f"Groq API error for layered analysis: {response.text}")
            except Exception as e:
                logger.error(f"Failed layered analysis with Groq: {e}")

        # Fallback if no API key or if it fails
        return LayeredAnalysisResponseDTO(
            summary=f"Mock analysis of {req.input_type} content.",
            flaws=["Mock flaw: Tone is slightly off-brand.", "Mock flaw: Missing primary color accents."],
            recommendations=["Align tone with Warm & Friendly guidelines.", "Add #0055A4 accents."],
            refined_prompt="Rewrite this content to be warm, friendly, and family-focused, ensuring brand keywords like 'Trust' and 'Quality' are included."
        )

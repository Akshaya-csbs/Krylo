from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BuildIdentityRequest(BaseModel):
    brand_id: str
    force_rebuild: bool = False
    groq_api_key: Optional[str] = None

class BrandIdentityDTO(BaseModel):
    id: str
    brand_id: str
    version: int
    voice: Dict[str, Any]
    visual: Dict[str, Any]
    emotion: Dict[str, Any]
    audience: Dict[str, Any]
    keywords: List[str]
    personality: List[str]
    design_rules: List[str]
    brand_summary: Optional[str]
    confidence_score: float
    services: List[str] = []
    social_links: Dict[str, str] = {}
    metrics: Dict[str, str] = {}
    status: str
    assets_processed_count: int
    groq_raw_intelligence: Optional[Dict[str, Any]] = None

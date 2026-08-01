from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field

class BrandIdentity(Document):
    brand_id: Indexed(str, unique=True)
    version: int = 1
    voice: Dict[str, Any] = Field(default_factory=dict)
    visual: Dict[str, Any] = Field(default_factory=dict)
    emotion: Dict[str, Any] = Field(default_factory=dict)
    audience: Dict[str, Any] = Field(default_factory=dict)
    keywords: List[str] = Field(default_factory=list)
    personality: List[str] = Field(default_factory=list)
    design_rules: List[str] = Field(default_factory=list)
    brand_summary: Optional[str] = None
    services: List[str] = Field(default_factory=list)
    social_links: Dict[str, str] = Field(default_factory=dict)
    metrics: Dict[str, str] = Field(default_factory=dict)
    confidence_score: float = 0.95
    status: str = "ready"  # processing, ready, outdated
    assets_processed_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "brand_identity"

class AIMemory(Document):
    brand_id: Indexed(str)
    entity_type: str  # asset, campaign, identity, trend
    entity_id: str
    content_text: str
    embedding: List[float] = Field(default_factory=list)
    summary: str
    embedding_model: str = "BGE-M3"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ai_memory"

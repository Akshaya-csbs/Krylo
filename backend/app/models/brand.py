from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field

class Brand(Document):
    organization_id: Indexed(str)
    name: str
    industry: str
    website: Optional[str] = None
    description: Optional[str] = None
    languages: List[str] = Field(default_factory=lambda: ["English"])
    logo_path: Optional[str] = None
    status: str = "active"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "brands"

class BrandAsset(Document):
    brand_id: Indexed(str)
    asset_name: str
    asset_type: str  # image, video, pdf, ppt, website, text, audio, logo
    category: str    # Advertisements, Brand Guidelines, Packaging, Social Media, Logo, Product Images
    storage_path: str
    storage_url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    mime_type: str
    status: str = "uploaded"  # uploaded, active, archived
    processing_status: str = "pending"  # uploaded -> queued -> processing -> completed -> failed
    extracted_text: Optional[str] = None  # AI-extracted text content from PDFs, docs, images
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "brand_assets"

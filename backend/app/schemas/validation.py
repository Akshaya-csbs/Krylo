from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ValidationCheckRequest(BaseModel):
    brand_id: str
    campaign_id: Optional[str] = None
    text_content: str
    image_url: Optional[str] = None
    platform: str = "Instagram"
    objective: str = "Brand Engagement"

class IssueDTO(BaseModel):
    category: str
    severity: str  # High, Medium, Low
    message: str
    solution: Optional[str] = None

class ValidationReportDTO(BaseModel):
    id: str
    campaign_id: str
    brand_id: str
    overall_score: float
    status: str
    scores: Dict[str, float]
    issues: List[IssueDTO]
    recommendations: List[str]
    created_at: str

class LayeredAnalysisRequest(BaseModel):
    brand_id: str
    input_type: str  # 'text', 'image', 'pdf', 'link'
    content: str     # Raw text, base64 image data, or URL depending on input_type

class LayeredAnalysisResponseDTO(BaseModel):
    summary: str
    flaws: List[str]
    recommendations: List[str]
    refined_prompt: str

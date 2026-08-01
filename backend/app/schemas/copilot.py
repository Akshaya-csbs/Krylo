from pydantic import BaseModel
from typing import List

class CopilotMessage(BaseModel):
    role: str
    content: str

class CopilotRequest(BaseModel):
    messages: List[CopilotMessage]
    groq_api_key: str
    brand_id: str

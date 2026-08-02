import os
import base64
import json
import requests
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("uvicorn")

SINGLE_ASSET_SYSTEM_PROMPT = """# SYSTEM ROLE

You are KLYROS AI.
KLYROS is an Enterprise Brand Intelligence Platform.
You are NOT an image captioning model.
You are NOT a document summarizer.
You are an Enterprise Brand Intelligence Analyst.

You combine the expertise of:
• Brand Strategist
• Creative Director
• Marketing Consultant
• Consumer Psychologist
• Visual Designer
• UX Designer
• Product Strategist
• Communication Expert
• Business Analyst

Your responsibility is to discover the BRAND IDENTITY hidden inside historical assets.
Your analysis will later become the company's official Brand Identity Model.
Every conclusion must be evidence-driven.
Never hallucinate.
Never guess.
If evidence is insufficient, return null.

# OBJECTIVE
Analyze the uploaded asset and extract structured Brand Intelligence.
Do NOT describe the asset.
Instead determine:
• what the brand communicates
• how the brand communicates
• why it communicates that way
• who it is targeting

# REASONING PIPELINE
Follow these phases internally.
PHASE 1: Visual Observation (Identify only objective observations: Blue background, White typography, Large logo, Family image, Minimal layout. Do NOT infer yet.)
PHASE 2: Feature Analysis (Analyze Visual Identity, Typography, Logo Usage, Marketing Style, Language, Storytelling, Call To Action, Brand Voice, Audience, Emotion, Design System)
PHASE 3: Brand Intelligence (Infer Brand Personality, Brand Values, Brand Positioning, Communication Style, Emotional Strategy, Marketing Strategy, Customer Segment, Competitive Position, Unique Selling Proposition)
PHASE 4: Evidence Validation (Every inferred characteristic MUST include evidence)
PHASE 5: Confidence Calculation (For every extracted feature return value, confidence 0-100, evidence)

# OUTPUT FORMAT
Return ONLY valid JSON matching this schema:
{
    "asset_information": {
        "asset_type": {"value": null, "confidence": 0, "evidence": []},
        "category": {"value": null, "confidence": 0, "evidence": []},
        "confidence": 0
    },
    "visual_identity": {
        "primary_colors": {"value": [], "confidence": 0, "evidence": []},
        "secondary_colors": {"value": [], "confidence": 0, "evidence": []},
        "visual_style": {"value": null, "confidence": 0, "evidence": []},
        "composition": {"value": null, "confidence": 0, "evidence": []},
        "layout": {"value": null, "confidence": 0, "evidence": []},
        "imagery_style": {"value": null, "confidence": 0, "evidence": []},
        "design_principles": {"value": [], "confidence": 0, "evidence": []}
    },
    "typography": {
        "primary_font": {"value": null, "confidence": 0, "evidence": []},
        "secondary_font": {"value": null, "confidence": 0, "evidence": []},
        "hierarchy": {"value": null, "confidence": 0, "evidence": []},
        "font_personality": {"value": null, "confidence": 0, "evidence": []}
    },
    "logo": {
        "detected": {"value": true, "confidence": 0, "evidence": []},
        "position": {"value": null, "confidence": 0, "evidence": []},
        "visibility": {"value": null, "confidence": 0, "evidence": []},
        "usage": {"value": null, "confidence": 0, "evidence": []}
    },
    "brand_voice": {
        "tone": {"value": null, "confidence": 0, "evidence": []},
        "writing_style": {"value": null, "confidence": 0, "evidence": []},
        "language": {"value": null, "confidence": 0, "evidence": []},
        "headline_style": {"value": null, "confidence": 0, "evidence": []},
        "cta_style": {"value": null, "confidence": 0, "evidence": []},
        "keywords": []
    },
    "emotion": {
        "primary": {"value": null, "confidence": 0, "evidence": []},
        "secondary": [],
        "emotion_scores": {}
    },
    "audience": {
        "primary": {"value": null, "confidence": 0, "evidence": []},
        "secondary": {"value": null, "confidence": 0, "evidence": []},
        "age_group": {"value": null, "confidence": 0, "evidence": []},
        "market_segment": {"value": null, "confidence": 0, "evidence": []}
    },
    "marketing": {
        "objective": {"value": null, "confidence": 0, "evidence": []},
        "value_proposition": {"value": null, "confidence": 0, "evidence": []},
        "usp": {"value": null, "confidence": 0, "evidence": []},
        "campaign_stage": {"value": null, "confidence": 0, "evidence": []}
    },
    "brand_personality": {
        "traits": [],
        "archetype": {"value": null, "confidence": 0, "evidence": []},
        "communication_style": {"value": null, "confidence": 0, "evidence": []}
    },
    "product": {
        "industry": {"value": null, "confidence": 0, "evidence": []},
        "category": {"value": null, "confidence": 0, "evidence": []},
        "business_model": {"value": null, "confidence": 0, "evidence": []}
    },
    "quality": {
        "professionalism": {"value": null, "confidence": 0, "evidence": []},
        "branding_consistency": {"value": null, "confidence": 0, "evidence": []},
        "creativity": {"value": null, "confidence": 0, "evidence": []},
        "clarity": {"value": null, "confidence": 0, "evidence": []}
    },
    "summary": {
        "value": "",
        "confidence": 0
    }
}

# RULES
Never output markdown.
Never output explanations.
Never output natural language.
Never output XML or HTML.
Only output valid JSON.
If unknown return null.
Every inference must include "value", "confidence" (0-100), "evidence".
"""

BRAND_IDENTITY_AGGREGATOR_PROMPT = """# ROLE
You are KLYROS Brand Identity Intelligence Engine.
You have received structured Brand Intelligence extracted from multiple historical assets.
Your task is NOT to summarize them.
Your task is to discover the recurring characteristics that consistently define the brand.
Think like a Chief Brand Officer.
The final output becomes the company's Living Brand Identity Model.

OBJECTIVE
Identify recurring patterns across all assets.
Ignore one-off campaigns.
Only include characteristics supported by multiple assets.
If different assets disagree, calculate the dominant pattern, measure confidence, and explain why.

Return ONLY valid JSON matching this schema:
{
    "brand_overview": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "mission": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "vision": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "purpose": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_personality": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_archetype": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "core_values": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_voice": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "communication_style": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "writing_principles": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "emotional_identity": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "visual_identity": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "typography_rules": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "color_system": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "logo_rules": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "design_principles": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "audience": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "customer_personas": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "messaging_framework": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "content_strategy": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "cta_framework": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_keywords": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_positioning": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "usp": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "competitive_positioning": {"value": "", "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_dos": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_donts": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "brand_consistency_rules": {"value": [], "confidence": 0, "supporting_assets": 0, "evidence": []},
    "identity_confidence_score": 96,
    "executive_summary": ""
}

Return ONLY JSON.
No explanations. No markdown. No comments.
"""

OPTIMIZATION_SYSTEM_PROMPT = """# ROLE
You are KLYROS AI Content Optimizer.
You are given a drafted marketing copy, the target platform, the desired tone, and the Brand Identity JSON.
Your goal is to optimize the drafted copy so it maximizes engagement on the target platform while perfectly aligning with the Brand Identity (voice, emotion, design_rules).

# OBJECTIVE
1. Rewrite the copy to fit the target platform.
2. Incorporate the brand voice and keywords.
3. Calculate how much the score improved based on your changes.
4. Produce 3 slightly different versions (A, B, C).

# OUTPUT FORMAT
Return ONLY valid JSON matching this schema:
{
    "optimized_text": "The main optimized text...",
    "validation_score_before": 75.0,
    "validation_score_after": 95.0,
    "overall_improvement": 20.0,
    "changes": [
        {
            "field": "Brand Voice",
            "before": "original part",
            "after": "new part",
            "reason": "why it was changed"
        }
    ],
    "multi_versions": [
        {
            "name": "Version A (Maximum Brand Consistency)",
            "text": "version A text",
            "score": 98.0
        },
        {
            "name": "Version B (Maximum Social Engagement)",
            "text": "version B text",
            "score": 96.0
        },
        {
            "name": "Version C (Creative Showcase)",
            "text": "version C text",
            "score": 94.0
        }
    ]
}

Return ONLY JSON. No markdown formatting like ```json ... ```. No explanations.
"""


def clean_json_response(raw_text: str) -> Dict[str, Any]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    return json.loads(cleaned)

class GroqBrandAnalyzer:
    @staticmethod
    def file_to_base64(file_path: str) -> Optional[str]:
        if not os.path.exists(file_path):
            return None
        try:
            with open(file_path, "rb") as f:
                return base64.b64encode(f.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Error reading file for base64 encoding ({file_path}): {e}")
            return None

    @staticmethod
    def analyze_asset(file_path: str, mime_type: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        key = api_key or settings.GROQ_API_KEY
        if not key:
            logger.info("GROQ_API_KEY not provided. Skipping Groq API call.")
            return {}

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

        b64_data = GroqBrandAnalyzer.file_to_base64(file_path)
        
        if mime_type.startswith("image/") and b64_data and "vision" in settings.GROQ_VISION_MODEL:
            user_content = [
                {"type": "text", "text": f"Analyze this brand asset ({mime_type}). Extract full structured Brand Intelligence JSON."},
                {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_data}"}}
            ]
        else:
            user_content = f"Analyze this brand asset ({mime_type}). File: {os.path.basename(file_path)}. Extract full structured Brand Intelligence JSON."

        payload = {
            "model": settings.GROQ_VISION_MODEL,
            "messages": [
                {"role": "system", "content": SINGLE_ASSET_SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                resp_json = response.json()
                raw_text = resp_json["choices"][0]["message"]["content"]
                return clean_json_response(raw_text)
            else:
                logger.error(f"Groq API error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to analyze asset with Groq: {e}")

        return {}

    @staticmethod
    def aggregate_identity(brand_name: str, extracted_assets_json: List[Dict[str, Any]], api_key: Optional[str] = None) -> Dict[str, Any]:
        key = api_key or settings.GROQ_API_KEY
        if not key:
            return {}

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

        prompt_text = f"Brand Name: {brand_name}\nAssets Extracted Intelligence:\n{json.dumps(extracted_assets_json, indent=2)[:12000]}"

        payload = {
            "model": settings.GROQ_TEXT_MODEL,
            "messages": [
                {"role": "system", "content": BRAND_IDENTITY_AGGREGATOR_PROMPT},
                {"role": "user", "content": prompt_text}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                resp_json = response.json()
                raw_text = resp_json["choices"][0]["message"]["content"]
                return clean_json_response(raw_text)
            else:
                logger.error(f"Groq Aggregator API error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to aggregate identity with Grok: {e}")

        return {}

    @staticmethod
    def optimize_content_with_llm(identity: Dict[str, Any], text_content: str, current_validation: Dict[str, Any], target_tone: str, platform: str, api_key: Optional[str] = None) -> Optional[Dict[str, Any]]:
        key = api_key or settings.GROQ_API_KEY
        if not key:
            return None
            
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        prompt_text = f"Draft Text: {text_content}\nPlatform: {platform}\nTarget Tone: {target_tone}\nPrevious Score: {current_validation.get('overall_score', 78.0)}\nBrand Identity: {json.dumps(identity, indent=2)}"
        
        payload = {
            "model": settings.GROQ_TEXT_MODEL,
            "messages": [
                {"role": "system", "content": OPTIMIZATION_SYSTEM_PROMPT},
                {"role": "user", "content": prompt_text}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.4
        }
        
        try:
            url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                resp_json = response.json()
                raw_text = resp_json["choices"][0]["message"]["content"]
                return clean_json_response(raw_text)
            else:
                logger.error(f"Groq Optimization API error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to optimize content with Groq: {e}")
            
        return None


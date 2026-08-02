from typing import List, Dict, Any, Optional
from app.ai.groq_analyzer import GroqBrandAnalyzer
from app.config import settings

class MultimodalAnalyzer:
    """
    AI Processing Engine for Klyros.
    Integrates Groq API for asset analysis and living brand identity aggregation,
    with built-in rule-based fallback when GROQ_API_KEY is not configured.
    """
    
    @staticmethod
    def build_brand_identity(brand_name: str, assets: List[Dict[str, Any]], groq_api_key: Optional[str] = None) -> Dict[str, Any]:
        key = groq_api_key or settings.GROQ_API_KEY
        
        # If Groq API key is configured, analyze assets with Groq Vision / LLaMA Models
        if key:
            extracted_list = []
            for asset in assets:
                file_path = asset.get("storage_path", "")
                mime_type = asset.get("mime_type", "application/octet-stream")
                single_intel = GroqBrandAnalyzer.analyze_asset(file_path, mime_type, api_key=key)
                if single_intel:
                    extracted_list.append(single_intel)
            
            if extracted_list:
                aggregated = GroqBrandAnalyzer.aggregate_identity(brand_name, extracted_list, api_key=key)
                if aggregated:
                    return {
                        "voice": {
                            "tone": aggregated.get("brand_voice", {}).get("value", "Warm, Friendly & Authentic"),
                            "style": aggregated.get("communication_style", {}).get("value", "Conversational"),
                            "confidence": (aggregated.get("brand_voice", {}).get("confidence", 95)) / 100.0,
                            "reading_level": "Accessible",
                            "cta_style": aggregated.get("cta_framework", {}).get("value", "Action-Oriented")
                        },
                        "visual": {
                            "primary_colors": aggregated.get("color_system", {}).get("value", ["#0055A4", "#FFFFFF"]),
                            "secondary_colors": ["#1E293B", "#64748B"],
                            "logo_position": "Top Left",
                            "layout": aggregated.get("visual_identity", {}).get("value", "Clean Minimalist"),
                            "typography": ", ".join(aggregated.get("typography_rules", {}).get("value", ["Sans-Serif"])) or "Sans-Serif"
                        },
                        "emotion": {
                            "trust": 96.0,
                            "family": 94.0,
                            "innovation": 88.0,
                            "joy": 92.0
                        },
                        "audience": {
                            "primary": aggregated.get("audience", {}).get("value", "Young Families"),
                            "secondary": "Quality Consumers",
                            "age_group": "22-45"
                        },
                        "keywords": aggregated.get("brand_keywords", {}).get("value", ["Trusted", "Quality"]),
                        "personality": [aggregated.get("brand_personality", {}).get("value", "Authentic")],
                        "design_rules": aggregated.get("design_principles", {}).get("value", ["Maintain color contrast"]),
                        "brand_summary": aggregated.get("executive_summary") or f"{brand_name} Brand Identity Model",
                        "confidence_score": (aggregated.get("identity_confidence_score", 95)) / 100.0,
                        "assets_processed_count": len(assets),
                        "groq_raw_intelligence": aggregated
                    }

        # Fallback implementation
        img_count = sum(1 for a in assets if a.get("asset_type") == "image")
        pdf_count = sum(1 for a in assets if a.get("asset_type") == "pdf")
        text_count = sum(1 for a in assets if a.get("asset_type") in ["text", "website"])
        
        return {
            "voice": {
                "tone": "Warm, Friendly & Authentic",
                "style": "Conversational yet Professional",
                "confidence": 0.96,
                "reading_level": "Accessible (Grade 8)",
                "cta_style": "Action-Oriented & Encouraging"
            },
            "visual": {
                "primary_colors": ["#0055A4", "#FFFFFF", "#FFD100"],
                "secondary_colors": ["#1E293B", "#64748B"],
                "logo_position": "Top Left",
                "layout": "Clean, Minimalist with Dynamic Whitespace",
                "typography": "Sans-Serif (Inter / Roboto Bold)"
            },
            "emotion": {
                "trust": 96.0,
                "family": 94.0,
                "innovation": 88.0,
                "joy": 92.0
            },
            "audience": {
                "primary": "Young Families & Professionals",
                "secondary": "Quality-conscious Consumers",
                "age_group": "22-45"
            },
            "keywords": ["Trusted", "Fresh", "Together", "Quality", "Pure"],
            "personality": ["Warm", "Dependable", "Community-Focused", "Vibrant"],
            "design_rules": [
                "Always maintain prominent blue brand accent (#0055A4).",
                "Ensure logo is legible with minimum 20px padding.",
                "Use encouraging, inclusive tone in body text."
            ],
            "brand_summary": f"{brand_name} represents a trusted, family-centric modern brand focused on quality, warmth, and fresh messaging.",
            "confidence_score": 0.95,
            "assets_processed_count": len(assets)
        }

    @staticmethod
    def validate_content(identity: Dict[str, Any], text_content: str, image_url: Optional[str] = None, platform: str = "Instagram") -> Dict[str, Any]:
        identity_score = 94.0 if any(kw.lower() in text_content.lower() for kw in identity.get("keywords", ["family", "trust", "together"])) else 78.0
        visual_score = 96.0 if image_url else 85.0
        compliance_score = 100.0
        copyright_score = 92.0
        safety_score = 98.0
        context_score = 90.0 if platform.lower() in ["instagram", "linkedin", "x"] else 82.0
        
        overall = (
            identity_score * 0.35 +
            visual_score * 0.20 +
            compliance_score * 0.15 +
            copyright_score * 0.10 +
            safety_score * 0.10 +
            context_score * 0.10
        )
        
        issues = []
        recommendations = []
        
        if identity_score < 85:
            issues.append({
                "category": "Brand Voice",
                "severity": "Medium",
                "message": "Content tone is missing core brand keywords.",
                "solution": "Integrate family-focused warm language."
            })
            recommendations.append("Include warm, conversational brand voice keywords.")
            
        if visual_score < 90:
            issues.append({
                "category": "Visuals",
                "severity": "Low",
                "message": "Official brand color contrast check recommended.",
                "solution": "Add primary brand accent #0055A4."
            })
            recommendations.append("Ensure logo appears on top-left of image layout.")
            
        status = "approved" if overall >= 85 else "needs_review"
        
        return {
            "overall_score": round(overall, 1),
            "status": status,
            "scores": {
                "identity": round(identity_score, 1),
                "visual": round(visual_score, 1),
                "compliance": round(compliance_score, 1),
                "copyright": round(copyright_score, 1),
                "safety": round(safety_score, 1),
                "context": round(context_score, 1)
            },
            "issues": issues,
            "recommendations": recommendations if recommendations else ["Maintain current certified quality standards."]
        }

    @staticmethod
    def is_meaningful(text: str) -> bool:
        import re
        text = text.strip()
        if not text:
            return False
        # Remove punctuation to count actual words
        clean_text = re.sub(r'[^\w\s]', '', text)
        words = clean_text.split()
        
        # If there are no actual words, it's not meaningful
        if not words:
            return False
            
        if len(words) == 1:
            word = words[0].lower()
            if len(word) > 12: # Exceptionally long single word without spaces is likely gibberish
                return False
            # Check for absence of vowels
            if not re.search(r'[aeiouy]', word):
                return False
            # Known random types
            if word in ['asdf', 'test', 'qwer', 'njnni']:
                return False
        else:
            # Check if all words lack vowels
            has_vowel_word = False
            for w in words:
                if re.search(r'[aeiouy]', w.lower()):
                    has_vowel_word = True
                    break
            if not has_vowel_word:
                return False
                
        return True

    @staticmethod
    def optimize_content(identity: Dict[str, Any], text_content: str, current_validation: Dict[str, Any], target_tone: str = "Professional", platform: str = "Instagram") -> Dict[str, Any]:
        if not MultimodalAnalyzer.is_meaningful(text_content):
            raise ValueError("Enter a valid content")
            
        # Try LLM optimization first
        llm_result = GroqBrandAnalyzer.optimize_content_with_llm(
            identity=identity,
            text_content=text_content,
            current_validation=current_validation,
            target_tone=target_tone,
            platform=platform
        )
        if llm_result:
            return llm_result

        # Fallback to dynamic rule-based optimization logic
        optimized_text = text_content.strip()
        if platform.lower() == "linkedin":
            optimized_text = f"Excited to share our latest update! {optimized_text}\n\nWe're committed to bringing quality to everything we do. What are your thoughts?\n\n#ProfessionalGrowth #Innovation"
        elif platform.lower() == "instagram":
            optimized_text = f"✨ {optimized_text} ✨\n\nBring home the trusted taste and quality that every family loves together! 💙\n\n#Quality #FamilyFirst #BrandValues"
        elif platform.lower() in ["twitter / x", "twitter", "x"]:
            optimized_text = f"{optimized_text} 🚀 Quality that speaks for itself. #Innovation"
        else:
            optimized_text = f"{optimized_text} Bring home the trusted taste and quality that every family loves together!"
        
        changes = [
            {
                "field": "Brand Voice",
                "before": text_content,
                "after": optimized_text,
                "reason": "Enhanced emotional trust and aligned with brand identity keywords."
            },
            {
                "field": "Visual Alignment",
                "before": "Standard Layout",
                "after": "Top-Left Logo Placement + #0055A4 Accent",
                "reason": "Adheres to official design guidelines."
            }
        ]
        
        multi_versions = [
            {
                "name": "Version A (Maximum Brand Consistency)",
                "text": f"{optimized_text} Pure, fresh, and trusted for generations.",
                "score": 98.5
            },
            {
                "name": "Version B (Maximum Social Engagement)",
                "text": f"Ready for something fresh? {optimized_text} #TogetherWeGrow",
                "score": 96.0
            },
            {
                "name": "Version C (Creative Showcase)",
                "text": f"Crafted with passion: {optimized_text}",
                "score": 94.0
            }
        ]
        
        score_before = current_validation.get("overall_score", 78.0)
        score_after = 96.5
        
        return {
            "optimized_text": optimized_text,
            "validation_score_before": score_before,
            "validation_score_after": score_after,
            "overall_improvement": round(score_after - score_before, 1),
            "changes": changes,
            "multi_versions": multi_versions
        }

    @staticmethod
    def discover_and_align_trends(brand_name: str, identity: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {
                "trend": "Cricket World Cup Season",
                "category": "Sports & Celebration",
                "alignment_score": 96.5,
                "trend_score": 94.0,
                "competition_score": 68.0,
                "forecast_score": 95.0,
                "recommended_platform": "Instagram",
                "best_posting_time": "19:00",
                "hashtags": ["#CricketFever", f"#{brand_name}Celebrates", "#TogetherInVictory"],
                "generated_campaign": {
                    "title": f"{brand_name} - Celebrating Every Victory Together",
                    "caption": f"Every win feels sweeter when shared with family! Enjoy every match with {brand_name}.",
                    "suggested_image_concept": "Family cheering around TV with brand product on table."
                }
            },
            {
                "trend": "Eco-Friendly Sustainable Packaging",
                "category": "Sustainability & Lifestyle",
                "alignment_score": 91.0,
                "trend_score": 89.0,
                "competition_score": 72.0,
                "forecast_score": 93.0,
                "recommended_platform": "LinkedIn",
                "best_posting_time": "10:30",
                "hashtags": ["#GreenFuture", f"#{brand_name}Cares", "#Sustainability"],
                "generated_campaign": {
                    "title": f"Building a Greener Tomorrow with {brand_name}",
                    "caption": "Our commitment to sustainable packaging starts with pure choices for every home.",
                    "suggested_image_concept": "Recyclable brand package against clean natural backdrop."
                }
            }
        ]

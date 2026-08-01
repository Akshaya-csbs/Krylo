import json
import httpx
from typing import List
from app.models.identity import BrandIdentity
from app.models.brand import BrandAsset, Brand
import random

class AIAnalysisService:
    @staticmethod
    async def analyze_assets_and_update_identity(brand_id: str, assets: List[BrandAsset], groq_api_key: str = None):
        brand = await Brand.get(brand_id)
        identity = await BrandIdentity.find_one(BrandIdentity.brand_id == brand_id)
        if not identity:
            identity = BrandIdentity(brand_id=brand_id)
            await identity.insert()
            
        asset_descriptions = []
        for asset in assets:
            asset_descriptions.append(f"Filename: {asset.asset_name}, Category: {asset.category}, Type: {asset.asset_type}")
            
        assets_context = "\n".join(asset_descriptions)
        
        system_prompt = f"""You are Klyro AI, an expert brand intelligence system.
Analyze the following newly uploaded brand assets for the brand '{brand.name}' (Industry: {brand.industry}).
Based on these assets and the brand's industry, generate a JSON response to update their Brand Intelligence portfolio.

Assets uploaded:
{assets_context}

You must return EXACTLY and ONLY a raw JSON object with the following schema:
{{
  "services": ["Service 1", "Service 2", "Service 3"],
  "keywords": ["Tag1", "Tag2", "Tag3"],
  "brand_summary": "A 1-2 sentence executive summary of what this brand does, updated to reflect the new assets.",
  "metrics": {{
    "avg_engagement": "X.X%",
    "monthly_reach": "X.XM",
    "post_validation": "XX/100"
  }},
  "social_links": {{
    "Website": "https://{brand.name.lower().replace(' ', '')}.com",
    "LinkedIn": "https://linkedin.com/company/{brand.name.lower().replace(' ', '')}"
  }}
}}
Ensure the metrics are realistic but optimistic for their industry."""

        # Attempt to call Groq if we have a key (or fallback to a mocked intelligent response for the hackathon demo)
        if groq_api_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {groq_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "llama-3.1-70b-versatile",
                            "messages": [{"role": "system", "content": system_prompt}],
                            "temperature": 0.7,
                            "response_format": {"type": "json_object"}
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        result = json.loads(data["choices"][0]["message"]["content"])
                        identity.services = result.get("services", identity.services)
                        identity.keywords = result.get("keywords", identity.keywords)
                        identity.brand_summary = result.get("brand_summary", identity.brand_summary)
                        identity.metrics = result.get("metrics", identity.metrics)
                        identity.social_links = result.get("social_links", identity.social_links)
                        await identity.save()
                        return identity
            except Exception as e:
                print(f"AI Analysis Failed: {e}")
                pass
        
        # Fallback simulation if no API key or if Groq fails
        # We will parse the filenames to generate something somewhat dynamic
        base_service = "Digital Strategy"
        if "design" in assets_context.lower() or "logo" in assets_context.lower():
            base_service = "Brand Identity Design"
        elif "pdf" in assets_context.lower() or "report" in assets_context.lower():
            base_service = "Industry Research"
            
        identity.services = [base_service, "Consulting", f"{brand.industry} Solutions"]
        identity.keywords = ["Innovative", "Data-Driven", "Enterprise"]
        identity.brand_summary = f"{brand.name} is a forward-thinking {brand.industry} brand, leveraging assets like {assets[0].asset_name} to drive growth."
        identity.metrics = {
            "avg_engagement": f"{round(random.uniform(3.0, 8.5), 1)}%",
            "monthly_reach": f"{round(random.uniform(0.5, 5.0), 1)}M",
            "post_validation": f"{random.randint(80, 98)}/100"
        }
        identity.social_links = {
            "Website": brand.website or f"https://{brand.name.lower().replace(' ', '')}.com",
            "Twitter": f"@{brand.name.lower().replace(' ', '')}"
        }
        
        await identity.save()
        return identity

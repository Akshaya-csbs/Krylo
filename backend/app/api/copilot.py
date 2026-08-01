import httpx
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.auth import StandardResponse
from app.schemas.copilot import CopilotRequest
from app.api.deps import get_current_user
from app.models.user import User
from app.models.brand import Brand
from app.models.identity import BrandIdentity
from app.config import settings

router = APIRouter(prefix="/copilot", tags=["Copilot"])

@router.post("/chat", response_model=StandardResponse)
async def chat_with_copilot(req: CopilotRequest, current_user: User = Depends(get_current_user)):
    # Use the key from the request, or fall back to the server-side key from .env
    api_key = req.groq_api_key or settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=400, detail="No Groq API Key available. Set GROQ_API_KEY in .env or pass it from the UI.")

    # 1. Fetch Brand Context
    brand = await Brand.get(req.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    identity = await BrandIdentity.find_one(BrandIdentity.brand_id == req.brand_id)
    
    # 2. Build System Prompt
    system_prompt = f"""You are Klyro Copilot, an expert AI marketing assistant. 
You are speaking to the marketing manager of the brand "{brand.name}" in the {brand.industry} industry.

Here is the Brand's Identity Matrix:
- Voice: {identity.voice if identity else "Professional and clear"}
- Visual: {identity.visual if identity else "Clean and modern"}
- Summary: {identity.brand_summary if identity else brand.description}

Rules:
1. Always adapt your suggestions to align with the brand's voice and industry.
2. Be concise, actionable, and highly professional.
3. If they ask you to draft content, provide the drafted copy directly.
"""

    # 3. Prepare messages for Groq API
    groq_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in req.messages:
        groq_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    # 4. Call Groq API natively
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.GROQ_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.GROQ_TEXT_MODEL,
                    "messages": groq_messages,
                    "temperature": 0.7,
                    "max_tokens": 1024
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"Groq API Error: {response.text}")
                # Fallback for hackathon demo if Groq key is invalid
                return StandardResponse(
                    success=True,
                    data={"reply": f"*(Simulated fallback due to API error: {response.status_code})* Based on the neural matrices I've synthesized, your brand's core identity revolves around Innovation. I recommend maintaining a tone that is empowering."}
                )

            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            
            return StandardResponse(
                success=True,
                data={"reply": reply}
            )
    except Exception as e:
        print(f"Copilot exception: {e}")
        return StandardResponse(
            success=True,
            data={"reply": "*(Simulated fallback due to Exception)* I'm currently detecting a spike in discussions around Ethical AI in Enterprise Solutions. Given your brand's focus, publishing a whitepaper would yield high engagement."}
        )

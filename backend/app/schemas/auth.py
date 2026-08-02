from typing import Optional, Any
from pydantic import BaseModel, EmailStr

class StandardResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None

class RegisterRequest(BaseModel):
    organization_name: str
    full_name: str
    email: EmailStr
    password: str
    role: str = "Manager"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserDTO(BaseModel):
    id: str
    organization_id: str
    full_name: str
    email: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserDTO

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

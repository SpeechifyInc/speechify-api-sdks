from typing import List, Literal, Optional
from pydantic import BaseModel, Field

from speechify_python_sdk.models.voice_model import VoiceModel


class VoicesResponse(BaseModel):
    id: str
    avatar_image: Optional[str] = Field(default="")
    display_name: str
    gender: Literal["male", "female", "notSpecified"]
    preview_audio: str
    tags: Optional[List[str]] = Field(default=[])
    type: str
    models: List[VoiceModel]

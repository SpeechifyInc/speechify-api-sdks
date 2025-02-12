from typing import List
from pydantic import BaseModel

from speechify_python_sdk.models.voice_model import VoiceModel


class CreateVoiceResponse(BaseModel):
    id: str
    display_name: str
    type: str
    models: List[VoiceModel]

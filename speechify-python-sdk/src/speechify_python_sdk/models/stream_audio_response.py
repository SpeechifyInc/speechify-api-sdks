from typing import List, Literal
from pydantic import BaseModel


class StreamAudioResponse(BaseModel):
    audio_data: str
    audio_format: Literal["wav", "mp3", "ogg", "aac"]

from typing import List, Literal
from pydantic import BaseModel


class SpeechMarkChunk(BaseModel):
    end: int
    end_time: float
    start: int
    start_time: float
    type: str
    value: str


class SpeechMarks(SpeechMarkChunk):
    end: int
    end_time: float
    start: int
    start_time: float
    type: str
    value: str
    chunks: List[SpeechMarkChunk]


class GenerateAudioResponse(BaseModel):
    audio_data: str
    audio_format: Literal["wav", "mp3", "ogg", "aac"]
    billable_characters_count: int
    speech_marks: SpeechMarks

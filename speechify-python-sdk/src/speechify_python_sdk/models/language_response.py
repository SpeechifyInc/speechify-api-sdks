from pydantic import BaseModel


class LanguageResponse(BaseModel):
    locale: str
    preview_audio: str

from typing import List, Literal
from pydantic import BaseModel

from speechify_python_sdk.models.language_response import LanguageResponse


class VoiceModel(BaseModel):
    name: Literal["simba-base", "simba-english", "simba-multilingual", "simba-turbo"]
    languages: List[LanguageResponse]

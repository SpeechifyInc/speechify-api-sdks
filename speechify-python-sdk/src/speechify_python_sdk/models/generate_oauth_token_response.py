from typing import List, Literal
from pydantic import BaseModel


class GenerateOAuthTokenResponse(BaseModel):
    access_token: str
    expires_in: int
    scope: str
    token_type: str

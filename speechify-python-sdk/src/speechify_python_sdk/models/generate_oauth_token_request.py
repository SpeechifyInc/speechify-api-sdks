from typing import Literal
from pydantic import BaseModel


class GenerateOAuthTokenRequest(BaseModel):
    def __init__(
        self,
        scope: str,
    ):
        """
        Build the request

        Arguments:
          scope: The scope, or a space-delimited list of scopes the token is requested for

        Returns:
          The request model
        """
        self.grant_type = "client_credential"
        self.scope = scope
